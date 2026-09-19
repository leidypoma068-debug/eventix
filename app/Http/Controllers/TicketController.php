<?php
namespace App\Http\Controllers;
use App\Models\Ticket;
use App\Models\Transfer;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
class TicketController extends Controller {
    public function index(Request $request){
        $tickets=Ticket::with(['event','ticketType'])->where('id_usuario',$request->user()->id_usuario)->latest('id_entrada')->get()->map(fn($t)=>[
            'id'=>$t->id_entrada,'code'=>$t->codigo,'token'=>$t->qr_token,'status'=>$t->estado,'holder'=>$t->titular_nombre,'email'=>$t->titular_correo,
            'event'=>['title'=>$t->event->nombre,'date'=>$t->event->fecha_evento->format('Y-m-d'),'time'=>substr($t->event->hora_inicio,0,5),'location'=>$t->event->ubicacion],
            'type'=>$t->ticketType->nombre,'qr_url'=>route('tickets.qr',$t),'pdf_url'=>route('tickets.pdf',$t)
        ]);
        return Inertia::render('Profile/MyTickets',['tickets'=>$tickets]);
    }
    private function own(Request $r,Ticket $t){ abort_unless($t->id_usuario===$r->user()->id_usuario || $r->user()->rol==='administrador',403); }
    public function qr(Request $request,Ticket $ticket){ $this->own($request,$ticket); $target=route('admin.validate.token',$ticket->qr_token); return response(\SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(320)->margin(1)->generate($target),200,['Content-Type'=>'image/svg+xml']); }
    public function pdf(Request $request, Ticket $ticket)
{
    $this->own($request, $ticket);

    $ticket->load([
        'event',
        'ticketType'
    ]);

    $validationUrl = route(
        'admin.validate.token',
        $ticket->qr_token
    );

    $qrSvg = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
        ->size(220)
        ->margin(1)
        ->generate($validationUrl);

    return Pdf::loadView('pdf.ticket', [
        'ticket' => $ticket,
        'qrSvg' => $qrSvg,
    ])
        ->setPaper('a4', 'landscape')
        ->download('EVENTIX-'.$ticket->codigo.'.pdf');
}
    public function transfer(Request $request,Ticket $ticket){
        $this->own($request,$ticket); abort_unless($ticket->estado==='vigente',422);
        $data=$request->validate(['correo'=>['required','email','exists:usuarios,correo']]);
        $dest=User::where('correo',$data['correo'])->firstOrFail(); abort_if($dest->id_usuario===$request->user()->id_usuario,422,'La entrada ya te pertenece.');
        $old=$ticket->qr_token; Transfer::create(['id_entrada'=>$ticket->id_entrada,'id_usuario_origen'=>$request->user()->id_usuario,'id_usuario_destino'=>$dest->id_usuario,'qr_token_anterior'=>$old]);
        $ticket->update(['id_usuario'=>$dest->id_usuario,'titular_nombre'=>$dest->nombre.' '.$dest->apellido,'titular_correo'=>$dest->correo,'qr_token'=>(string)Str::uuid(),'estado'=>'transferida']);
        return back()->with('success','Entrada transferida. El QR anterior quedó invalidado.');
    }
}
