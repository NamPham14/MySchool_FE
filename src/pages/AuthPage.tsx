/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useGoogleLoginMutation } from '../store/api/baseApi';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';
import toast from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleLogin as useReactOAuthGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const AuthPage = () => {
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginWithGoogle = useReactOAuthGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } },
        );
        
        const email = userInfo.data.email;
        if (!email) {
          toast.error("Không lấy được email từ Google.");
          return;
        }

        const response = await googleLogin({ email }).unwrap();
        if (response.code === 1000 && response.data) {
          dispatch(setAuth({ accessToken: response.data.token, refreshToken: response.data.refreshToken }));
          toast.success('Đăng nhập bằng Google thành công!');
          navigate('/dashboard');
        } else {
          toast.error(response.message || 'Đăng nhập thất bại!');
        }
      } catch (err: any) {
        toast.error(err?.data?.message || 'Email này chưa được đăng ký trong hệ thống!');
      }
    },
    onError: errorResponse => toast.error('Đăng nhập Google thất bại!'),
  });

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-orange-50 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] border border-white p-10 m-4 relative z-10">
        
        {/* Logo / Header Area */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo_fschool.png" 
              alt="FPT School Logo" 
              className="h-24 object-contain drop-shadow-md"
            />
          </div>
          <p className="text-gray-500 text-sm font-medium mt-4">Hệ thống quản lý trường học thông minh</p>
        </div>

        {/* Google Login Only Area */}
        <div className="mt-8">
          <p className="text-center text-gray-500 mb-6 text-sm">Vui lòng đăng nhập bằng tài khoản Google (Dành cho Quản trị viên và Giáo viên)</p>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Đang xử lý...
              </>
            ) : (
              <>
                <div className="bg-white p-1 rounded-full mr-3">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="h-5 w-5" />
                </div>
                Đăng nhập bằng Google
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
