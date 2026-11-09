import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4.5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[13px] font-medium">Nama lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama lengkap"
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[13px] font-medium">Alamat email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[13px] font-medium">Kata sandi</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Buat kata sandi"
                                    passwordrules={passwordRules}
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-[13px] font-medium">
                                    Konfirmasi kata sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-11 w-full rounded-lg bg-[#406e49] text-sm font-semibold text-white shadow-sm hover:bg-[#355d3d]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Buat akun
                            </Button>
                        </div>

                        <div className="text-center text-[13px] text-[#657269]">
                            Sudah punya akun?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="text-[#406e49] hover:text-[#2f5236]"
                            >
                                Masuk
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Buat akun admin',
    description: 'Isi data berikut untuk membuat akun pengelola laporan.',
};
