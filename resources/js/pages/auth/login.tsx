import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Masuk" />

            {status && (
                <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3 text-sm font-medium text-primary">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[13px] font-medium">Alamat email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-[13px] font-medium">
                                        Kata sandi
                                    </Label>
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan kata sandi"
                                    className="auth-input h-11 rounded-lg border-transparent bg-[#f2f4f2] px-3.5 text-[#222a24] shadow-none placeholder:text-[#8a938b] focus-visible:border-[#406e49] focus-visible:bg-white focus-visible:ring-[#406e49]/15"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-[13px] font-normal text-[#657269]"
                                    >
                                        Ingat saya
                                    </Label>
                                </div>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs font-medium text-[#406e49] hover:text-[#2f5236]"
                                        tabIndex={4}
                                    >
                                        Lupa kata sandi?
                                    </TextLink>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-11 w-full rounded-lg bg-[#406e49] text-sm font-semibold text-white shadow-sm hover:bg-[#355d3d]"
                                tabIndex={5}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Masuk
                            </Button>
                        </div>

                        <div className="text-center text-[13px] text-muted-foreground">
                            Belum punya akun?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={6}
                                className="text-[#406e49] hover:text-[#2f5236]"
                            >
                                Daftar
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Selamat datang kembali',
    description: 'Masuk untuk meninjau dan mengelola laporan yang masuk.',
};
