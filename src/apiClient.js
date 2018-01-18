'use strict';

/**
 * API Client
 */

const xhr = require('superagent');

const API = require('./api');
const typeUtils = require('./types');

const platform = typeof FormData === 'undefined' ? 'node' : 'browser';

let singleton;

function filterEmptyStrings(obj) {
    let retObj = JSON.parse(JSON.stringify(obj, function(key, val) {
        if (typeUtils.isString(val) && val == '')
            return undefined;
        return val;
    }));

    return retObj;
};

function APIClient(opts) {
    opts = typeUtils.isObject(opts) ? opts : {};
    this._api = new API(opts);
};

APIClient.prototype.request = function(method, partialRoute, data, authKey) {
    let url = this._api.getRoute(partialRoute);

    method = typeUtils.isString(method) ? method : 'get';
    method = method.toLowerCase();
    if (!typeUtils.isFunction(xhr[method]))
        throw new Error('Unsupported method.');

    const dataFields = typeUtils.isObject(data) ? Object.keys(data) : [];
    const isFormData = platform == 'node' ?
        dataFields.find(key => typeUtils.isObjectOfType(data[key], Buffer)) :
        typeUtils.isObjectOfType(data, FormData);

    let req = xhr[method](url)
        .accept('json');

    if (platform == 'node' && isFormData) {
        dataFields.forEach(item => {
            const method = typeUtils.isObjectOfType(data[item], Buffer) ? 'attach' : 'field';
            req[method](item, data[item], method == 'attach' ? item : undefined);
        });

        data = null;
    }

    if (!isFormData)
        req.type('json');

    if (typeUtils.isObject(data)) {
        req = method == 'post' ? req.send(data) : req.query(data);
    }

    if (authKey)
        req.set('Authorization', `Bearer ${authKey}`);

    return new Promise((resolve, reject) => {
        req.end((err, res) => {
            if (err || !(res.body && res.body.success)) {
                if (res && res.body && res.body.error && typeUtils.isObject(res.body.error))
                    res.body.error.status = res.statusCode;
                return reject(res && res.body && res.body.error ? res.body.error : err);
            }

            return resolve(res.body && res.body.hasOwnProperty('data') ? res.body.data : null);
        });
    });
};

['get', 'post', 'put', 'delete'].forEach((methodName) => {
    APIClient.prototype[methodName] = function(...params) {
        return this.request(methodName, ...params);
    };
});

APIClient.getSingleton = function(opts) {
    if (!singleton)
        singleton = new APIClient(opts);

    return singleton;
};

module.exports = APIClient;
