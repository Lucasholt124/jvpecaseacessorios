"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Clock, Calculator } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  description: string;
}

interface ShippingCalculatorProps {
  productWeight?: number;
  productPrice?: number;
}

export default function ShippingCalculator({
  productWeight = 1,
  productPrice = 0,
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanCep = cep.replace(/\D/g, "");

  const calculateShipping = async () => {
    if (cleanCep.length !== 8) {
      setError("CEP inválido");
      setShippingOptions([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simula chamada API com delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const basePrice = productWeight * 10;
      // Prefixos para região Sudeste (exemplo)
      const isSoutheast = ["01", "02", "03", "04", "05", "08", "09"].includes(
        cleanCep.substring(0, 2)
      );
      const multiplier = isSoutheast ? 1 : 1.5;

      const options: ShippingOption[] = [
        {
          id: "pac",
          name: "PAC",
          price: productPrice >= 100 ? 0 : basePrice * multiplier,
          days: isSoutheast ? "3-5 dias úteis" : "5-8 dias úteis",
          description: "Entrega econômica",
        },
        {
          id: "sedex",
          name: "SEDEX",
          price: basePrice * 1.5 * multiplier,
          days: isSoutheast ? "1-2 dias úteis" : "2-4 dias úteis",
          description: "Entrega expressa",
        },
        {
          id: "sedex10",
          name: "SEDEX 10",
          price: basePrice * 2.5 * multiplier,
          days: "Até 10h do próximo dia útil",
          description: "Entrega super expressa",
        },
      ];

      setShippingOptions(options);
    } catch {
      setError("Erro ao calcular frete. Tente novamente.");
      setShippingOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setError("");
    if (shippingOptions.length > 0) setShippingOptions([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" aria-hidden="true" />
          Calcular Frete
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateShipping();
          }}
          className="flex gap-2"
          aria-describedby={error ? "cep-error" : undefined}
        >
          <div className="flex-1">
            <Label htmlFor="cep" className="text-sm">
              CEP de entrega
            </Label>
            <Input
              id="cep"
              name="cep"
              value={cep}
              onChange={handleCepChange}
              placeholder="00000-000"
              maxLength={9}
              aria-invalid={!!error}
              aria-describedby={error ? "cep-error" : undefined}
              className={error ? "border-red-500" : ""}
              autoComplete="postal-code"
            />
            {error && (
              <p
                id="cep-error"
                className="text-sm text-red-500 mt-1"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isLoading || cleanCep.length !== 8}
              aria-disabled={isLoading || cleanCep.length !== 8}
            >
              {isLoading ? "Calculando..." : "Calcular"}
            </Button>
          </div>
        </form>

        {productPrice >= 100 && (
          <div
            className="bg-green-50 border border-green-200 rounded-lg p-3"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 text-green-800">
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm font-medium">Frete GRÁTIS para este produto!</span>
            </div>
          </div>
        )}

        {shippingOptions.length > 0 && (
          <section
            className="space-y-3"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Opções de entrega"
          >
            <h4 className="font-medium text-sm">Opções de entrega:</h4>
            {shippingOptions.map((option) => (
              <article
                key={option.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                role="region"
                aria-label={`Opção de entrega ${option.name}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    <span className="font-medium">{option.name}</span>
                    {option.price === 0 && (
                      <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                    )}
                  </div>
                  <span className="font-bold text-primary">
                    {option.price === 0 ? "Grátis" : formatPrice(option.price)}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span>{option.days}</span>
                  </div>
                  <span>{option.description}</span>
                </div>
              </article>
            ))}

            <div
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
              role="note"
              aria-label="Informações importantes sobre o frete"
            >
              <div className="flex items-start gap-2 text-blue-800">
                <MapPin className="w-4 h-4 mt-0.5" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-medium">Informações importantes:</p>
                  <ul className="mt-1 space-y-1 text-xs list-disc list-inside">
                    <li>Prazos contados em dias úteis após a confirmação do pagamento</li>
                    <li>Frete grátis para pedidos acima de R$ 100</li>
                    <li>Entrega realizada pelos Correios</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}
