import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "output/**",
      "docs/**",
      "plus-ui/**",
      "ruoyi-app-plus-public/**",
      "ruoyi-plus-uniapp-docs/**",
      "ruoyi-plus-uniapp-jwqdjs/**",
      "ruoyi-plus-uniapp-workflow/**",
      "RuoYi-Vue-Plus-5.X/**",
      "RuoYi-master/**",
      "ruoyi-ai-main/**",
      "taste-skill-main/**",
      "tools/**",
      "cal-com-main/**",
      "pretix-master/**",
      "medusa-develop/**",
      "ruoyi-vue-pro-2026.05-jdk17-21-/**",
      "ruoyi-vue-pro-master/**",
      "saleor-main/**",
      "barber-booking-app-0.14_server_side/**"
    ]
  }
];

export default eslintConfig;
