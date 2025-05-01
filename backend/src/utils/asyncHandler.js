const asyncHandler = (requestHandler) => (req, res, next) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err));
    }
}


export {asyncHandler};
// This is a higher-order function that takes a request handler function as an argument and returns a new function.