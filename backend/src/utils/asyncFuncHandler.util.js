/**
 * 
 * @param {*} func 
 * @returns A function with wrapped in promise.
 */

//A utility function that wraps an async function for express route handlers.

const asyncFuncHandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((err) => next(err));
  }
}

export { asyncFuncHandler };