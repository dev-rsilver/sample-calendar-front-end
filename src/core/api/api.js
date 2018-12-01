
/**
 * API client.
 */
var ApiClient = function() {

    var _this = this;

    var serviceUrl = process.env.REACT_APP_SERVICE_URL;

    if(serviceUrl === undefined) {
        throw new Error("Environment variable 'REACT_APP_SERVICE_URL' must be specified and point to the url of the data service.");
    }

    if(serviceUrl.endsWith("/")) {
        serviceUrl = serviceUrl.substring(0, serviceUrl.length - 1);
    }

    /**
     * AuthenticationContext which the API client will use to retrieve the JWT
     * and undertake other actions.
     */
    this.context = undefined;

    /**
     * Set to true to automatically redirect on 401s (for instance, resulting from
     * an invalid token). If true, failureCallback for various functions will be ignored.
     */
    this.redirectOnUnauthorized = false;

    /**
     * Logs in user.
     */
    this.signin = async function(username, password, successCallback, failureCallback) {

        if(username === undefined || username.trim().length <= 0) {
            throw new Error("Username must be supplied.");
        }

        if(password === undefined || password.trim().length <= 0) {
            throw new Error("Password must be supplied.");
        }

        await postRequest("token/signin", [
             new RequestParameter("username", username),
             new RequestParameter("password", password)
            ],        
            successCallback, 
            failureCallback);
       
    }

    /**
     * Gets events based on the parameters supplied.
     */
    this.getEvents = async function(startDate, stopDate, index, num, successCallback, failureCallback) {
        await getRequest("api/events", [
            new RequestParameter("startDate", startDate),
            new RequestParameter("stopDate", stopDate),
            new RequestParameter("index", index),
            new RequestParameter("num", num)
        ],
        successCallback,
        failureCallback)
    }

    /**
     * Get an event by id.
     */
    this.getEventById = async function(id, successCallback, failureCallback) {
       await getRequest("api/events/" + id, [], successCallback, failureCallback);
    }

    /**
     * Issues a GET request to the data service.
     * @param {*} params An array of RequestParameter objects.
     */
    async function getRequest(url, params, successCallback, failureCallback) {
        if(successCallback !== undefined && typeof successCallback !== "function") {
            throw new Error("successCallback must be a function.");
        }

        if(failureCallback !== undefined && typeof failureCallback !== "function") {
            throw new Error("failureCallback must be a function.");
        }
        
        if(!Array.isArray(params)) {
            throw new Error("params must be an array.");
        }
        
        var queryString = "";

        for(var i = 0; i < params.length; i++) {
            if(!(params[i] instanceof RequestParameter)) {
                throw new Error("params[i] must be a RequestParameter object.");
            }

            if(queryString.length <= 0) {
                queryString += "?";
            } else {
                queryString += "&";
            }

            queryString += `${encodeURIComponent(params[i].name)}=${encodeURIComponent(params[i].value)}`;
        }

        var headers = {
            "Content-Type": "application/json"
        }

        if(_this.context !== undefined) {
            if(!Object.getOwnPropertyNames(_this.context).includes("token")) {
                throw new Error("context must be an instance of AuthenticationContext");
            }
            
            headers["Authorization"] = `bearer ${_this.context.token}`;
        }

        var response = await fetch(`${serviceUrl}/${encodeURI(url)}${queryString}`, {
            method: "GET",
            headers: headers
          });

        if(response.status !== 200) { 
            //API calls requiring authentication result in a 401 when unauthorized.
            //Signin returns a 403 when the username and/or password are incorrect.

            if(_this.redirectOnUnauthorized) {
                if(_this.context === undefined) {
                    throw new Error("Context must be provided if redirectOnUnauthorized is true.");
                }

                if(response.status === 401) {
                    _this.context.notifyTokenInvalid();
                }
            } else {
                if(failureCallback) {
                    failureCallback(response.status);
                }
            }
        } else {      
          var json = await response.json();
          
          if(json) {
            if(successCallback) {
                //By convention, all API calls return a "result" object,
                //so we can provide that result object to the callback.
                successCallback(json.result);
            }
          }
        }
      
    }


    /**
     * Issues a POST request to the data service.
     * @param {*} params An array of RequestParameter objects.
     */
    async function postRequest(url, params, successCallback, failureCallback) {

        if(successCallback !== undefined && typeof successCallback !== "function") {
            throw new Error("successCallback must be a function.");
        }

        if(failureCallback !== undefined && typeof failureCallback !== "function") {
            throw new Error("failureCallback must be a function.");
        }
        
        if(!Array.isArray(params)) {
            throw new Error("params must be an array.");
        }
        
        var obj = {};

        for(var i = 0; i < params.length; i++) {
            if(!(params[i] instanceof RequestParameter)) {
                throw new Error("params[i] must be a RequestParameter object.");
            }

            obj[params[i].name] = params[i].value;
        }

        var headers = {
            "Content-Type": "application/json"
        }

        if(_this.context !== undefined) {
            if(!Object.getOwnPropertyNames(_this.context).includes("token")) {
                throw new Error("context must be an instance of AuthenticationContext");
            }

            headers["Authorization"] = `bearer ${_this.context.token}`;
        }

        var response = await fetch(`${serviceUrl}/${encodeURI(url)}`, {
            method: "POST",
            headers: headers,
            body: await JSON.stringify(obj)
          });

        if(response.status !== 200) { 
            //API calls requiring authentication result in a 401 when unauthorized.
            //Signin returns a 403 when the username and/or password are incorrect.

            if(_this.redirectOnUnauthorized) {
                if(_this.context === undefined) {
                    throw new Error("Context must be provided if redirectOnUnauthorized is true.");
                }

                if(response.status === 401) {
                    _this.context.notifyTokenInvalid();
                }
            } else {
                if(failureCallback) {
                    failureCallback(response.status);
                }
            }

        } else {      
          var json = await response.json();
          
          if(json) {
            if(successCallback) {
                //By convention, all API calls return a "result" object,
                //so we can provide that result object to the callback.
                successCallback(json.result);
            }
          }
        }
    }


}


class RequestParameter {

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    name = undefined;
    value = undefined;
}


export { ApiClient }