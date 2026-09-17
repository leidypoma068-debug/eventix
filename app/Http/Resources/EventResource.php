<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id_evento,
            'title' => $this->nombre,
            'date' => $this->fecha_evento->format('Y-m-d'),
            'time' => substr($this->hora_inicio, 0, 5),
            'location' => $this->ubicacion,
            'image' => $this->imagen,
            'price' => $this->precio_desde,
            'category' => CategoryResource::make(
                $this->whenLoaded('category')
            ),
        ];
    }
}