import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styles personnalisés pour les toasts
const toastOptions = {
  position: "bottom-center" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  className: 'custom-toast',
  style: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  progressClassName: 'toast-progress-bar'
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const options = {
    ...toastOptions,
    className: `custom-toast ${type}-toast`,
  };

  switch (type) {
    case 'success':
      toast.success(message, options);
      break;
    case 'error':
      toast.error(message, options);
      break;
    default:
      toast.info(message, options);
  }
};

// Styles globaux pour les toasts
const toastStyles = `
  .Toastify__toast-container {
    width: 100%;
    max-width: 500px;
    padding: 0 1rem;
  }
  
  .Toastify__toast {
    margin-bottom: 1rem;
    font-family: inherit;
    border-radius: 8px;
  }
  
  .Toastify__toast-body {
    padding: 0.75rem 1rem;
  }
  
  .toast-progress-bar {
    background: linear-gradient(to right, #4f46e5, #7c3aed) !important;
  }
  
  .success-toast {
    background-color: #1f2937 !important;
  }
  
  .error-toast {
    background-color: #1f2937 !important;
  }
  
  .info-toast {
    background-color: #1f2937 !important;
  }
`;

// Ajout des styles globaux
document.head.insertAdjacentHTML('beforeend', `<style>${toastStyles}</style>`);

export const ToastNotification = () => (
  <ToastContainer
    position="bottom-center"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="dark"
    style={{ bottom: '1rem' }}
  />
);
