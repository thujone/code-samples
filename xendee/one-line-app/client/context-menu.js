/****************************************************************************
 ** Context menus for the Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import {
    IEdge,
    INode,
    Point
} from '../yfiles/lib/es-modules/yfiles.js'

import constants from './constants.js'
import messages from './messages.js'
import Device from './device.js'
import Notification from './notification.js'
import GraphState from './graphing/GraphState.js'


export default class ContextMenu {
    constructor(app) {
        this.contextMenu = document.createElement('div')
        this.contextMenu.setAttribute('class', 'context-menu')

        this.app = app

        this.notification = new Notification()

        this.currentProjectElement = null
        this.currentFromDevice = null
        this.currentToDevice = null
        this.element = this.contextMenu
        this.deleteNodePrompt = null
        this.deleteBranchPrompt = null

        this.focusOutListener = event => {
            this.onFocusOut(event.relatedTarget)
        }

        this.focusInListener = () => {
            if (this.blurredTimeout) {
                clearTimeout(this.blurredTimeout)
                this.blurredTimeout = null
            }
        }

        this.closeListener = event => {
            event.stopPropagation()
            this.close()
            this.app.graphComponent.focus()
            this.onClosedCallback()
        }

        this.closeOnEscListener = event => {
            if (event.keyCode === 27 && this.element.parentNode) {
                this.closeListener(event)
            }
        }
    }

    getSelectedProjectElementFromYWorksModelItem(item) {
        return GraphState.Current.Mapper.getProjectElementFromYWorksModelItem(item)
    }

    addContextMenuListeners(graphComponent) {
        this.addOpeningEventListeners(graphComponent, location => {
            if (graphComponent.inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
                this.show(location)
            }
        })

        graphComponent.inputMode.addPopulateItemContextMenuListener((sender, args) => {
            if (!args.item) {
                this.populateDefaultContextMenu(graphComponent, args)
            } else {
                this.currentProjectElement = this.getSelectedProjectElementFromYWorksModelItem(args.item)

                if (this.currentProjectElement) {
                    if (this.currentProjectElement.IsNode) {
                        this.populateNodeContextMenu(graphComponent, args)
                    } else if (this.currentProjectElement.IsBranch) {
                        this.currentFromDevice = this.currentProjectElement.FromDeviceId ? this.app.getDevice(this.currentProjectElement.FromDeviceId) : null
                        this.currentToDevice = this.currentProjectElement.ToDeviceId ? this.app.getDevice(this.currentProjectElement.ToDeviceId) : null

                        this.populateBranchContextMenu(graphComponent, args)
                    }
                }
            }
        })

        graphComponent.inputMode.contextMenuInputMode.addCloseMenuListener(() => {
            this.close()
        })

        this.onClosedCallback = () => {
            graphComponent.inputMode.contextMenuInputMode.menuClosed()
        }
    }

    populateDefaultContextMenu(graphComponent, args) {
        args.showMenu = true

        this.clearItems()

        if (this.app.nodeIdInClipboard !== null) {
            const menuText = '<i class="far fa-paste context-menu-icon"></i> Paste ' + this.app.getClipboardNodeName()
            this.addMenuItem(menuText, () => this.app.pasteNodeFromClipboard())
        }
    }

    populateNodeContextMenu(graphComponent, args) {
        args.showMenu = true

        this.clearItems()
        this.app.GraphEditorInputMode.setSelected(args.item, true)

        if (graphComponent.selection.selectedNodes.size > 0) {
            this.addMenuItem('<i class="far fa-copy context-menu-icon"></i> Copy ' + this.currentProjectElement.Name,
                () => this.app.copyNodeToClipboard(this.currentProjectElement))
            this.addMenuItem('<i class="far fa-edit context-menu-icon"></i> Edit ' + this.currentProjectElement.Name,
                () => this.app.showNodeModal())
            this.addMenuItem('<i class="far fa-trash-alt context-menu-icon"></i> Delete ' + this.currentProjectElement.Name,
                () => this.showDeleteNodePrompt())
        }
    }

    populateBranchContextMenu(graphComponent, args) {
        args.showMenu = true

        this.clearItems()
        this.app.GraphEditorInputMode.setSelected(args.item, true)

        if (graphComponent.selection.selectedEdges.size > 0) {
            if (this.currentFromDevice) {
                if (this.currentFromDevice.DeviceOpen)
                    this.addMenuItem('<i class="far fa-plus-octagon context-menu-icon"></i> Close ' + this.currentFromDevice.Name,
                        () => this.app.updateDeviceState(this.currentFromDevice, constants.BRANCH_SIDES.FROM, false))
                else
                    this.addMenuItem('<i class="far fa-minus-octagon context-menu-icon"></i> Open ' + this.currentFromDevice.Name,
                        () => this.app.updateDeviceState(this.currentFromDevice, constants.BRANCH_SIDES.FROM, true))

                this.addMenuItem('<i class="far fa-edit context-menu-icon"></i> Edit ' + this.currentFromDevice.Name,
                    () => this.app.showDeviceModal(this.currentFromDevice))
                this.addMenuItem('<i class="far fa-trash-alt context-menu-icon"></i> Delete ' + this.currentFromDevice.Name,
                    () => this.showDeleteFromDevicePrompt())
                this.addSeparator()
            }

            if (this.currentToDevice) {
                if (this.currentToDevice.DeviceOpen)
                    this.addMenuItem('<i class="far fa-plus-octagon context-menu-icon"></i> Close ' + this.currentToDevice.Name,
                        () => this.app.updateDeviceState(this.currentToDevice, constants.BRANCH_SIDES.TO, false))
                else
                    this.addMenuItem('<i class="far fa-minus-octagon context-menu-icon"></i> Open ' + this.currentToDevice.Name,
                        () => this.app.updateDeviceState(this.currentToDevice, constants.BRANCH_SIDES.TO, true))

                this.addMenuItem('<i class="far fa-edit context-menu-icon"></i> Edit ' + this.currentToDevice.Name,
                    () => this.app.showDeviceModal(this.currentToDevice))
                this.addMenuItem('<i class="far fa-trash-alt context-menu-icon"></i> Delete ' + this.currentToDevice.Name,
                    () => this.showDeleteToDevicePrompt())
                this.addSeparator()
            }

            this.addMenuItem('<i class="far fa-edit context-menu-icon"></i> Edit ' + this.currentProjectElement.Name,
                () => this.app.showBranchModal())
            this.addMenuItem('<i class="far fa-trash-alt context-menu-icon"></i> Delete ' + this.currentProjectElement.Name,
                () => this.showDeleteBranchPrompt())
        }
    }

    showDeleteNodePrompt() {
        if (this.currentProjectElement) {
            this.notification.showConfirm(
                messages.CONFIRM_DELETE_NODE(this.currentProjectElement.Name),
                () => this.onDeleteNodeConfirmed(),
                () => this.onDeleteNodeCancelled()
            )
        }
    }

    onDeleteNodeConfirmed() {
        if (this.currentProjectElement) {
            // Server takes care of deleting associated branches, but we still need to delete
            // associated branches from the app state.
            this.app.deleteNode(this.currentProjectElement)
            this.currentProjectElement = null
        }
    }

    onDeleteNodeCancelled() {
        this.currentProjectElement = null
    }

    showDeleteBranchPrompt() {
        if (this.currentProjectElement) {
            this.notification.showConfirm(
                messages.CONFIRM_DELETE_BRANCH(this.currentProjectElement.Name),
                () => this.onDeleteBranchConfirmed(),
                () => this.onDeleteBranchCancelled()
            )
        }
    }

    onDeleteBranchConfirmed() {
        if (this.currentProjectElement) {
            this.app.deleteBranch(this.currentProjectElement, true)
            this.currentProjectElement = null
        }
    }

    onDeleteBranchCancelled() {
        this.currentProjectElement = null
    }

    showDeleteFromDevicePrompt() {
        if (this.currentFromDevice) {
            this.notification.showConfirm(
                messages.CONFIRM_DELETE_DEVICE(this.currentFromDevice.Name),
                () => this.onDeleteFromDeviceConfirmed(),
                () => this.onDeleteFromDeviceCancelled()
            )
        }
    }

    onDeleteFromDeviceConfirmed() {
        if (this.currentFromDevice) {
            this.app.deleteDevice(this.currentFromDevice, constants.BRANCH_SIDES.FROM, false)
            this.currentProjectElement = null
            this.currentFromDevice = null
        }
    }

    onDeleteFromDeviceCancelled() {
        this.currentProjectElement = null
        this.currentFromDevice = null
    }

    showDeleteToDevicePrompt() {
        if (this.currentToDevice) {
            this.notification.showConfirm(
                messages.CONFIRM_DELETE_DEVICE(this.currentToDevice.Name),
                () => this.onDeleteToDeviceConfirmed(),
                () => this.onDeleteToDeviceCancelled()
            )
        }
    }

    onDeleteToDeviceConfirmed() {
        if (this.currentToDevice) {
            this.app.deleteDevice(this.currentToDevice, constants.BRANCH_SIDES.TO, false)
            this.currentProjectElement = null
            this.currentToDevice = null
        }
    }

    onDeleteToDeviceCancelled() {
        this.currentProjectElement = null
        this.currentToDevice = null
    }

    addSeparator() {
        const separator = document.createElement('div')
        separator.setAttribute('class', 'separator')
        this.element.appendChild(separator)
    }

    addMenuItem(label, clickListener) {
        const menuItem = document.createElement('button')
        menuItem.setAttribute('class', 'menu-item')
        menuItem.innerHTML = label
        if (clickListener !== null) {
            menuItem.addEventListener('click', clickListener, false)
        }
        this.element.appendChild(menuItem)
        return menuItem
    }

    clearItems() {
        const element = this.element
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    show(location) {
        if (this.element.childElementCount <= 0) {
            return
        }

        this.element.addEventListener('focusout', this.focusOutListener)
        this.element.addEventListener('focusin', this.focusInListener)
        this.element.addEventListener('click', this.closeListener, false)
        document.addEventListener('keydown', this.closeOnEscListener, false)

        const style = this.element.style
        style.setProperty('position', 'absolute', '')
        style.setProperty('left', `${location.x}px`, '')
        style.setProperty('top', `${location.y}px`, '')
        document.body.appendChild(this.element)

        setTimeout(() => {
            this.element.setAttribute('class', `${this.element.getAttribute('class')} visible`)
        }, 0)

        this.element.firstElementChild.focus()
        this.isOpen = true
    }

    close() {
        this.element.removeEventListener('focusout', this.focusOutListener)
        this.element.removeEventListener('focusin', this.focusInListener)
        this.element.removeEventListener('click', this.closeListener, false)
        document.removeEventListener('keydown', this.closeOnEscListener, false)

        const parentNode = this.element.parentNode
        if (parentNode) {
            const contextMenuClone = this.element.cloneNode(true)
            contextMenuClone.setAttribute(
                'class',
                `${contextMenuClone.getAttribute('class')} context-menu-clone`
            )
            parentNode.appendChild(contextMenuClone)
            setTimeout(() => {
                contextMenuClone.setAttribute(
                    'class',
                    contextMenuClone.getAttribute('class').replace(/\s?visible/, '')
                )

                setTimeout(() => {
                    parentNode.removeChild(contextMenuClone)
                }, 300)
            }, 0)

            this.element.setAttribute(
                'class',
                this.element.getAttribute('class').replace(/\s?visible/, '')
            )
            parentNode.removeChild(this.element)
        }

        this.isOpen = false
    }

    get onClosedCallback() {
        if (!this.onClosedCallbackField) {
            alert('For this context menu, the onClosedCallback property must be set.')
        }
        return this.onClosedCallbackField
    }

    set onClosedCallback(callback) {
        this.onClosedCallbackField = callback
    }

    addOpeningEventListeners(graphComponent, openingCallback) {
        const componentDiv = graphComponent.div
        const contextMenuListener = event => {
            event.preventDefault()
            if (this.isOpen) {
                return
            }
            const me = event
            if (event.mozInputSource === 1 && me.button === 0) {
                openingCallback(ContextMenu.getCenterInPage(componentDiv))
            } else if (me.pageX === 0 && me.pageY === 0) {
                openingCallback(ContextMenu.getCenterInPage(componentDiv))
            } else {
                openingCallback(new Point(me.pageX, me.pageY))
            }
        }

        componentDiv.addEventListener('contextmenu', contextMenuListener, false)

        graphComponent.addTouchLongPressListener((sender, args) => {
            openingCallback(
                graphComponent.toPageFromView(graphComponent.toViewCoordinates(args.location))
            )
        })

        componentDiv.addEventListener('keyup', event => {
            if (event.keyCode === 93) {
                event.preventDefault()
                openingCallback(ContextMenu.getCenterInPage(componentDiv))
            }
        })
    }

    onFocusOut(relatedTarget) {
        if (relatedTarget) {
            if (relatedTarget.parentElement && relatedTarget.parentElement !== this.element) {
                this.close()
            }
        } else if (!this.blurredTimeout) {
            this.element.addEventListener('focusin', this.focusInListener)
            this.blurredTimeout = setTimeout(() => {
                this.close()
            }, 150)
        }
    }

    static getCenterInPage(element) {
        let left = element.clientWidth / 2.0
        let top = element.clientHeight / 2.0
        while (element.offsetParent) {
            left += element.offsetLeft
            top += element.offsetTop
            element = element.offsetParent
        }
        return new Point(left, top)
    }
}
