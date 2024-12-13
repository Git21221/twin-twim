export const asyncFuncHandler = (func) => {
  return (req, res, next) => {
    Promise.resolve(func(req, res, next)).catch((er) => next(er));
  };
};
