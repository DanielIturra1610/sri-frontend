'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { SupplierService } from '@/services/supplierService';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Textarea } from '@/components/ui';
import type { CreateSupplierDTO } from '@/types';
import toast from 'react-hot-toast';

export default function CreateSupplierPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateSupplierDTO>({
    name: '',
    rut: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      setIsSubmitting(true);
      await SupplierService.createSupplier(formData);
      toast.success('Proveedor creado exitosamente');
      router.push('/suppliers');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear proveedor');
      console.error('Error creating supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/suppliers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-7 w-7" />
            Nuevo Proveedor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registra un nuevo proveedor en el sistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre del proveedor"
                required
              />
              <Input
                label="RUT"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                placeholder="12.345.678-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Nombre Contacto"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                placeholder="Nombre del contacto"
              />
              <Input
                label="Email Contacto"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="email@ejemplo.com"
              />
              <Input
                label="Teléfono Contacto"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Dirección del proveedor"
              />
              <Input
                label="Ciudad"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ciudad"
              />
            </div>

            <Textarea
              label="Notas"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el proveedor..."
              rows={3}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/suppliers')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Proveedor
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
