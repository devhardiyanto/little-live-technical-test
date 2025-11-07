// Layouts
import LayoutDefault from "@/layouts/default.vue";

// Pages
const Payment = () => import("@/views/payment").then(m => m.Payment);

const payment = [
  {
    path: "/payment",
    component: LayoutDefault,
    children: [
      {
        path: "",
        name: "payment",
        component: Payment,
        meta: {
          breadcrumb: "Payment",
          requiresAuth: true,
        },
      },
    ],
  },
];

export default payment;
