<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Convierte la ruta guardada en BD en una URL que el navegador sí puede abrir.
     *
     * Ejemplos:
     * events/foto.jpg          -> /storage/events/foto.jpg
     * storage/events/foto.jpg  -> /storage/events/foto.jpg
     * /storage/events/foto.jpg -> /storage/events/foto.jpg
     * img/events/foto.jpg      -> /img/events/foto.jpg
     * https://...              -> se conserva tal cual
     */
    private function imageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $path = trim($path);

        if ($path === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:')) {
            return $path;
        }

        if (str_starts_with($path, '/')) {
            return $path;
        }

        if (
            str_starts_with($path, 'storage/') ||
            str_starts_with($path, 'img/') ||
            str_starts_with($path, 'images/')
        ) {
            return '/'.$path;
        }

        return '/storage/'.ltrim($path, '/');
    }

    public function toArray($request): array
    {
        return [
            'id' => $this->id_evento,
            'title' => $this->nombre,
            'description' => $this->descripcion,
            'date' => $this->fecha_evento->format('Y-m-d'),
            'time' => substr($this->hora_inicio, 0, 5),
            'location' => $this->ubicacion,
            'image' => $this->imageUrl($this->imagen),
            'price' => $this->precio_desde,

            'category' => CategoryResource::make(
                $this->whenLoaded('category')
            ),

            'ticketTypes' => TicketTypeResource::collection(
                $this->whenLoaded('ticket_types')
            ),
        ];
    }
}
