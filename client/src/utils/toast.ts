import { showToast, showSuccessToast, showFailToast, showLoadingToast } from 'vant';
import 'vant/es/toast/style';

export const toast = {
  success: (message: string) => {
    showSuccessToast({
      message,
      duration: 2000,
      position: 'top',
      className: 'custom-toast-small',
    });
  },

  error: (message: string) => {
    showFailToast({
      message,
      duration: 2000,
      position: 'top',
      className: 'custom-toast-small',
    });
  },

  info: (message: string) => {
    showToast({
      message,
      duration: 2000,
      position: 'top',
      className: 'custom-toast-small',
    });
  },

  loading: (message: string = '加载中...') => {
    return showLoadingToast({
      message,
      forbidClick: true,
      duration: 0,
      position: 'top',
      className: 'custom-toast-small',
    });
  },
};
