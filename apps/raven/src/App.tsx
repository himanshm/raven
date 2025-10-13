import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import AuthInitializer from "./components/AuthInitializer";
import { AppProvider } from "./contexts/AppProvider";
import router from "./routes";
import { store } from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <AppProvider defaultTheme="system" storageKey="app-theme">
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </AppProvider>
    </Provider>
  );
};

export default App;
