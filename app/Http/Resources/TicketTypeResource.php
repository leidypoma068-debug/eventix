<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TicketTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id_tipo_entrada,
            'name' => $this->nombre,
            'description' => $this->descripcion,
            'price' => $this->precio,
            'max_purchase' => $this->limite_por_compra,
        ];
    }
}