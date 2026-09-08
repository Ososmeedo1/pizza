"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";
import {useSession, signIn} from "next-auth/react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Loader2} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {Input} from "@/components/ui/Input";
import {Label} from "@/components/ui/Label";
import {Button} from "@/components/ui/Button";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const {status} = useSession();

  const schema = useMemo(
    () =>
      z.object({
        email: z.email(t("validation.invalidEmail")),
        password: z.string().min(1, t("validation.required")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm({resolver: zodResolver(schema)});

  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(`/${locale}/admin`);
    }
  }, [status, locale, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center py-6">
      <Card className="shadow-clay">
        <CardHeader className="text-center">
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(async (values) => {
              setError(null);
              const result = await signIn("credentials", {
                redirect: false,
                email: values.email,
                password: values.password,
              });
              if (result?.error) {
                setError(t("loginError"));
                return;
              }
              router.push(`/${locale}/admin`);
            })}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                aria-invalid={errors.email ? "true" : undefined}
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-error">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={t("passwordPlaceholder")}
                aria-invalid={errors.password ? "true" : undefined}
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-error">{errors.password.message}</p>
              ) : null}
            </div>

            {error ? <p className="text-sm text-error">{error}</p> : null}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || status === "loading"}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("loginButton")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href={`/${locale}/admin/register`}
              className="text-sm text-brand underline-offset-4 hover:underline"
            >
              {t("goToRegister")}
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}