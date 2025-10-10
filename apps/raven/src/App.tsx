import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { AppProvider } from "./contexts/AppContext";
import router from "./routes";
import { store } from "./store";

const App = () => {
  return (
    <Provider store={store}>
      <AppProvider defaultTheme="system" storageKey="app-theme">
        <RouterProvider router={router} />
      </AppProvider>
    </Provider>
  );
};

export default App;
