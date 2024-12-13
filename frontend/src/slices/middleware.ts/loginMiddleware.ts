import { login } from "../authSlice";

export const loginMiddleware = (store: any) => (next: any) => (action: any) => {
  console.log(action);
  if (action.type === "auth/getAuth/fulfilled") {
    if (action.payload.statusCode === 200) {
      store.dispatch(login({ isAuthenticated: true, user: action.payload.data }));
    }
  }
  next(action);
}