import { showToast, showSuccessToast, showFailToast, showLoadingToast } from 'vant';
import 'vant/es/toast/style';

export const toast = {
  success: (message: string) => {
    showSuccessToast({
      message,
      duration: 2000,
    });
  },

  error: (message: string) => {
    showFailToast({
      message,
      duration: 2000,
    });
  },

  info: (message: string) => {
    showToast({
      message,
      duration: 2000,
    });
  },

  loading: (message: string = '加载中...') => {
    return showLoadingToast({
      message,
      forbidClick: true,
      duration: 0,
    });
  },
};
