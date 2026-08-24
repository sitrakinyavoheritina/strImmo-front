'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from './schemas';

export const useRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      console.log('Inscription Onina :', data);
      // TODO: Appel vers auth.service.ts
    } catch (error) {
      console.error('Erreur inscription :', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    showPassword,
    showConfirmPassword,
    isLoading,
    setShowPassword,
    setShowConfirmPassword,
    onSubmit: form.handleSubmit(onSubmit),
  };
};