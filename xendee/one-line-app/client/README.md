# How to run and deploy the One-Line app

## Dev environment:

> `cd Xendee.Web/js/one-line`

> `npm install`

**NOTE:** If webpack complains about installing `webpack-cli`, just run this: `npm install -g webpack-cli`

> `npm run watch-js-oneline`

**NOTE:** The initial downloading of packages and compiling can take several minutes to complete, so be patient. Once the front end is being "watched," updates to the JS or SCSS will automatically reload the browser, and changes will be (nearly) instantaneous.

## Prod environment:

> `cd Xendee.Web/js/one-line`

> `npm install`

> `npm run build-prod-oneline`

The task opens the /Areas/Studio/Views/OneLine/ViewWebpackTemplate.cshtml file as a template, injects a script reference, and outputs to View.cshtml in the same directory. Make sure to manually reload the page in your browser AFTER you've run the build-prod-oneline task to ensure you have the latest build of View.cshtml.

If you're trying to test `build-prod-oneline` on your localhost, keep in mind you need to negate the Request.IsLocal logic in ViewWebpackTemplate.cshtml so that your localhost thinks it's the production environment.

When doing a rollout, you need to upload: `/Areas/Studio/Views/OneLine/View.cshtml` and the `/js/one-line/dist/main.xxx.prod.js` file.
