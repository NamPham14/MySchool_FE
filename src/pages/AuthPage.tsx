/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/baseApi';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';
import toast from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !password) {
      toast.error('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!');
      return;
    }

    try {
      const response = await login({ phoneNumber, password }).unwrap();
      if (response.code === 1000 && response.data) {
        dispatch(setAuth({ accessToken: response.data.token, refreshToken: response.data.refreshToken }));
        toast.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        toast.error(response.message || 'Đăng nhập thất bại!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Sai số điện thoại hoặc mật khẩu!');
    }
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

        {/* Form Area */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 placeholder:text-gray-400"
                  placeholder="Nhập số điện thoại..."
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Mật khẩu</label>
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-300 placeholder:text-gray-400"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-all"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer transition-colors"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer select-none">
              Duy trì đăng nhập
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Đang xử lý...
              </>
            ) : (
              'Đăng nhập vào hệ thống'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
