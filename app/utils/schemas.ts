import z from "zod";

export const UserSchema = z.object({
    username: z.string()
        .min(1, 'Kullanıcı Adı Boş Bırakılamaz!')
        .min(3, 'Kullanıcı Adı En Az 3 Karakter Olmalı!')
        .max(20, 'Kullanıcı Adı En Fazla 20 Karakter Olabilir!')
        .trim(),
    password: z.string()
        .min(1, 'Şifre Boş Bırakılamaz!')
        .min(6, 'Şifre En Az 6 Karakter Olmalı!')
        .max(21, 'Şifre En Fazla 21 Karakter Olabilir!')
        .trim(),
    email: z.string()
        .trim()
        .toLowerCase()
        .optional() 
        .or(z.literal('')) 
        .refine(val => !val || val.length >= 5, {
            message: 'Email en az 5 karakter olmalıdır'
        })
        .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
            message: 'Geçersiz Bir Email Adresi Girdiniz!'
        })
        .refine(val => !val || val.length <= 35, {
            message: 'Email Adresi En Fazla 35 Karakter Olabilir!'
        })
})

export const CardSchema = z.object({
    cardHolderName: z.string()
        .min(1, 'Kart üzerindeki isim boş bırakılamaz!')
        .min(3, 'İsim en az 3 karakter olmalıdır!')
        .trim(),
    
    cardNumber: z.string()
        .length(16, 'Kart numarası eksik veya hatalı! (16 hane olmalı)'),
    
    expiryDate: z.string()
        .length(5, 'Son kullanma tarihi MM/YY formatında olmalıdır!')
        .includes('/', { message: 'Geçersiz tarih formatı!' }),
    
    cvv: z.string()
        .length(3, 'CVV kodu 3 haneli olmalıdır!')
        .regex(/^[0-9]+$/, { message: 'CVV kodu sadece rakamlardan oluşmalıdır!' })
})

export const UpdatePasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Mevcut şifrenizi girmeniz gerekiyor!')
        .min(6, 'Mevcut şifreniz en az 6 karakter olmadılır!')
        .max(21, 'Mevcut şifreniz en fazla 21 karekter olmadılır!'),
    
    newPassword: z.string()
        .min(1, 'Yeni şifre alanı boş bırakılamaz!')
        .min(6, 'Yeni şifreniz en az 6 karakter olmalıdır!')
        .max(21, 'Yeni şifreniz en fazla 21 karakter olabilir!'),
    
    confirmPassword: z.string()
        .min(1, 'Şifre tekrar alanı boş bırakılamaz!')
        .min(6, 'Şifre tekrar alanı en az 6 karakter olmalıdır!')
        .max(21, 'Şifre tekrar alanı en fazla 21 karakter olmalıdır!'),
})
.refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yeni şifreleriniz birbiriyle uyuşmuyor!",
    path: ["confirmPassword"] 
})