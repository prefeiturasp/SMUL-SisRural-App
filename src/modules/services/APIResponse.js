export function APIResponse(obj = {}) {
    obj.pristine = true;
    obj.loading = false; //true | false
    obj.status = null; //200 , 400 , 404 .. etc
    obj.result = null; // {json}
    obj.error = false; //true | false

    return obj;
}
