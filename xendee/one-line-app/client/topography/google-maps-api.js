/****************************************************************************
 ** Load Google Maps dynamically.
 **
 ** @license
 ** Copyright (c) 2020 Xendee Corporation. All rights reserved.
 ***************************************************************************/
class GoogleMapsApi {
  constructor(gApiKey) {

    this.apiKey = gApiKey;
    this.libraries = ['geometry', 'drawing']

    if (!window._GoogleMapsApi) {
      this.callbackName = '_GoogleMapsApi.mapLoaded'
      window._GoogleMapsApi = this
      window._GoogleMapsApi.mapLoaded = this.mapLoaded.bind(this)
    }
  }

  load() {
    if (!this.promise) {
      this.promise = new Promise(resolve => {
        this.resolve = resolve

        if (typeof window.google === 'undefined') {
          const script = document.createElement('script')
          script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=${this.callbackName}&libraries=${this.libraries.join(',')}`
          script.async = true
          document.body.append(script)

        } else {
          this.resolve()
        }
      });
    }

    return this.promise
  }

  mapLoaded() {
    if (this.resolve) {
      this.resolve()
    }
  }
}

export default GoogleMapsApi
