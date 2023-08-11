/****************************************************************************
 ** Notification toasts and modals for the Xendee One-Line diagramming app.
 **
 ** @license
 ** Copyright (c) 2019 Xendee Corporation. All rights reserved.
 ***************************************************************************/
import Noty from 'noty'
import constants from './constants.js'
import messages from './messages.js'


export default class Notification {
    constructor() {
        this.baseToastSettings = {
            theme: 'bootstrap-v4',
            layout: 'bottomRight',
            closeWith: ['click'],
            progressBar: true,
            timeout: 2000
        }
        this.baseModalSettings = {
            theme: 'bootstrap-v4',
            layout: 'center',
            closeWith: ['button'],
            modal: true,
            killer: true
        }
        this.warningButtonClasses = 'btn btn-warning',
        this.defaultButtonClasses = 'btn btn-default',
        this.successButtonClasses = 'btn btn-success',
        this.dangerButtonClasses = 'btn btn-danger',
        this.secondaryButtonClasses = 'btn btn-secondary',
        this.basicButtonClasses = 'btn'
    }

    showSuccess(message, callback = null) {
        const successToast = new Noty({
            ...this.baseToastSettings,
            type: 'success',
            text: message
        })
        successToast.show()
        if (callback) {
            setTimeout(() => {
                callback()
            }, this.baseToastSettings.timeout)
        }
    }

    showModalSuccess(message, buttonsArr) {
        const messageModal = new Noty({
            ...this.baseModalSettings,
            type: 'success',
            text: message,
            buttons: buttonsArr.map(item => {
                return Noty.button(item.label, item.classList, () => {
                    messageModal.close()
                    item.callback && item.callback()
                })
            })
        })
        messageModal.show()
    }

    showInfo(message) {
        const infoToast = new Noty({
            ...this.baseToastSettings,
            type: 'info',
            text: message
        })
        infoToast.show()
    }

    showError(message, callback = null) {
        const errorModal = new Noty({
            ...this.baseModalSettings,
            type: 'error',
            text: message,
            buttons: [
                Noty.button('OK', this.dangerButtonClasses, () => {
                    errorModal.close()
                    callback && callback()
                })
            ]
        })
        errorModal.show()
    }

    showImportantMessage(message, callback = null) {
        const messageModal = new Noty({
            ...this.baseModalSettings,
            type: 'info',
            text: message,
            buttons: [
                Noty.button('OK', this.basicButtonClasses, () => {
                    messageModal.close()
                    callback && callback()
                })
            ]
        })
        messageModal.show()
    }

    showWideImportantMessage(message, callback = null) {
        this.showImportantMessage(message, callback)
        document.querySelector('#noty_layout__center').classList.add('wide')
    }

    showProgressMessage(message, callback = null) {
        const messageModal = new Noty({
            ...this.baseModalSettings,
            type: 'info',
            text: message,
            buttons: []
        })
        messageModal.show()
    }

    showConfirm(message, confirmCallback = null, cancelCallback = null) {
        const confirmModal = new Noty({
            ...this.baseModalSettings,
            type: 'warning',
            text: message,
            buttons: [
                Noty.button('Yes', this.warningButtonClasses, () => {
                    confirmModal.close()
                    confirmCallback && confirmCallback()
                }),
                Noty.button('No', this.basicButtonClasses, () => {
                    confirmModal.close()
                    cancelCallback && cancelCallback()
                })
            ]
        })
        confirmModal.show()
    }
}