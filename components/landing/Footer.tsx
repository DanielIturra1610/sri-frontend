'use client';

import { Package, Mail, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/Separator';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                SRI Inventarios
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Sistema de gestión de inventarios diseñado para PyMEs que
              quieren crecer sin perder el control de su stock.
            </p>
            <div className="flex gap-3">
              <a href="mailto:contacto@sriinventarios.com">
                <Button variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
                  Contacto
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Características
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cómo funciona
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Crear cuenta gratis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">¿Necesitas ayuda?</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Estamos aquí para ayudarte a configurar tu sistema y resolver
              cualquier duda.
            </p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Soporte directo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Respuesta en menos de 24 horas para usuarios en prueba gratuita.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SRI Inventarios. Hecho con dedicación para PyMEs.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidad
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
