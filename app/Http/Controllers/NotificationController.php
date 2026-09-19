<?php

namespace App\Http\Controllers;

use App\Models\EventixNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function read(Request $request, EventixNotification $notification)
    {
        abort_unless($notification->id_usuario === $request->user()->id_usuario, 403);

        if (!$notification->leida) {
            $notification->update([
                'leida' => true,
                'leida_en' => now(),
            ]);
        }

        return back();
    }

    public function readAll(Request $request)
    {
        EventixNotification::where('id_usuario', $request->user()->id_usuario)
            ->where('leida', false)
            ->update([
                'leida' => true,
                'leida_en' => now(),
            ]);

        return back();
    }
}
