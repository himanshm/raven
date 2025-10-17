import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import AuthProvider from "./components/AuthProvider";
import { AppProvider } from "./contexts/AppProvider";
import router from "./routes";
import { store } from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <AppProvider defaultTheme="system" storageKey="app-theme">
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </AppProvider>
    </Provider>
  );
};

export default App;
