// Layouts
import LayoutAuth from "@/layouts/auth.vue";

// Pages
const Login = () => import("@/views/auth").then(m => m.AuthLogin);

const auth = [
  {
    path: "/login",
    component: LayoutAuth,
    children: [
      {
        path: "",
        name: "login",
        component: Login,
        meta: {
          breadcrumb: "Login",
          requiresAuth: false,
        },
      },
    ],
  },
];

export default auth;
