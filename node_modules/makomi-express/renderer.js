/**
 * Render the given route
 * @param route     The route
 * @param method    HTTP method
 * @param params    Parameters passed to the route
 * @param data      Data source(s) to override default data source(s) for the route
 */
exports.render = function(appLocation,route,method,params,data,cb){

    /**
     * So because makomi-express renders express, this is super-easy,
     * because we can do everything in JS. But if your framework was
     * another language, you could call out to it here as long as
     * you captured the output and returned it per spec.
     */

    // get our mock requester
    var request = require('express-mock-request');

    // include the actual app, which is written to allow this to work
    // FIXME: will this change correctly when files are modified?
    var app = require(appLocation + "app.js");

    // TODO: select method
    // TODO: provide params to request
    // TODO: use data if supplied to substitute for existing data sources

    request(app).get(route).expect(function(response) {
        cb(response);
    });

}
