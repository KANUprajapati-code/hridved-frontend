import{j as l,d as m}from"./index-jnhJKHVM.js";import{m as p}from"./vendor-ui-cGIEGKxt.js";const c=({children:e,variant:r="primary",size:o="md",onClick:a,disabled:t=!1,className:s="",...i})=>{const n={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-base",lg:"px-6 py-3 text-lg"},g={primary:"bg-blue-500 text-white hover:bg-blue-600",secondary:"bg-gray-200 text-gray-800 hover:bg-gray-300",danger:"bg-red-500 text-white hover:bg-red-600",success:"bg-green-500 text-white hover:bg-green-600"};return l.jsx(p.button,{variants:m,initial:"initial",whileHover:t?{}:"hover",whileTap:t?{}:{scale:.95},onClick:a,disabled:t,className:`
        relative rounded-lg font-medium transition-all duration-300
        ${n[o]}
        ${g[r]}
        ${t?"opacity-50 cursor-not-allowed":"cursor-pointer"}
        ${s}
      `,...i,children:e})};export{c as A};
