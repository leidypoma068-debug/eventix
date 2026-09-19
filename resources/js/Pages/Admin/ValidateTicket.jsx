import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
    CameraIcon,
    QrCodeIcon,
    CheckCircleIcon,
    XCircleIcon,
    PhotoIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '../../Layouts/AdminLayout';
import { Card, PageTitle } from '../../Components/AdminUi';

function normalizeQrValue(rawValue) {
    if (!rawValue) return '';

    const raw = String(rawValue).trim();

    try {
        const url = new URL(raw);
        const parts = url.pathname.split('/').filter(Boolean);
        return decodeURIComponent(parts.at(-1) ?? raw);
    } catch {
        return raw;
    }
}

export default function ValidateTicket({ result = null, recent = [] }) {
    const form = useForm({ value: '' });
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanFrameRef = useRef(null);
    const [camera, setCamera] = useState(false);
    const [message, setMessage] = useState('');
    const [readingImage, setReadingImage] = useState(false);

    const validateValue = (rawValue) => {
        const value = normalizeQrValue(rawValue);

        if (!value) {
            setMessage('No se pudo obtener un código válido del QR.');
            return;
        }

        form.setData('value', value);
        setMessage('QR detectado. Validando entrada...');

        router.post(
            '/admin/validar',
            { value },
            {
                preserveScroll: true,
                onError: () => setMessage('El QR fue leído, pero no corresponde a una entrada válida.'),
            }
        );
    };

    const submit = (e) => {
        e.preventDefault();
        const value = normalizeQrValue(form.data.value);
        form.setData('value', value);
        form.post('/admin/validar', { preserveScroll: true });
    };

    const stopCamera = () => {
        if (scanFrameRef.current) {
            cancelAnimationFrame(scanFrameRef.current);
            scanFrameRef.current = null;
        }

        streamRef.current?.getTracks()?.forEach((track) => track.stop());
        streamRef.current = null;
        setCamera(false);
    };

    const scanVideoFrame = () => {
        const video = videoRef.current;

        if (!video || !streamRef.current) return;

        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'attemptBoth',
            });

            if (code?.data) {
                stopCamera();
                validateValue(code.data);
                return;
            }
        }

        scanFrameRef.current = requestAnimationFrame(scanVideoFrame);
    };

    const startCamera = async () => {
        setMessage('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            setCamera(true);

            setTimeout(async () => {
                if (!videoRef.current) return;

                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                scanVideoFrame();
            }, 100);
        } catch {
            setMessage('No se pudo abrir la cámara. Revisa los permisos del navegador.');
        }
    };

    const scanImage = async (file) => {
        if (!file) return;

        setReadingImage(true);
        setMessage('Leyendo el QR de la imagen...');

        try {
            const objectUrl = URL.createObjectURL(file);
            const image = new Image();

            image.onload = () => {
                try {
                    const maxSide = 2200;
                    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
                    const width = Math.max(1, Math.round(image.naturalWidth * scale));
                    const height = Math.max(1, Math.round(image.naturalHeight * scale));

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    context.drawImage(image, 0, 0, width, height);

                    const imageData = context.getImageData(0, 0, width, height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                    });

                    URL.revokeObjectURL(objectUrl);
                    setReadingImage(false);

                    if (!code?.data) {
                        setMessage('No se detectó un QR legible en la imagen. Prueba con una captura más nítida y sin recortar el código.');
                        return;
                    }

                    validateValue(code.data);
                } catch {
                    URL.revokeObjectURL(objectUrl);
                    setReadingImage(false);
                    setMessage('No se pudo procesar la imagen seleccionada.');
                }
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                setReadingImage(false);
                setMessage('No se pudo abrir la imagen seleccionada.');
            };

            image.src = objectUrl;
        } catch {
            setReadingImage(false);
            setMessage('No se pudo leer la imagen seleccionada.');
        }
    };

    useEffect(() => () => stopCamera(), []);

    return (
        <AdminLayout>
            <Head title="Validación QR" />

            <div className="mx-auto max-w-[1300px] p-5 sm:p-8">
                <PageTitle
                    title="Validación de entradas"
                    description="Escanea con la cámara, importa una imagen con QR o escribe el código manualmente. El QR se valida automáticamente al detectarlo."
                />

                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
                    <Card className="p-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="rounded-3xl border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-center">
                                <QrCodeIcon className="mx-auto h-12 w-12 text-violet-600" />
                                <h2 className="mt-3 text-lg font-black">Escanear QR</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Usa la cámara del equipo. EVENTIX detectará el código y lo validará automáticamente.
                                </p>

                                <button
                                    type="button"
                                    onClick={camera ? stopCamera : startCamera}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white hover:bg-violet-700"
                                >
                                    <CameraIcon className="h-5 w-5" />
                                    {camera ? 'Cerrar cámara' : 'Usar cámara'}
                                </button>

                                {camera && (
                                    <video
                                        ref={videoRef}
                                        muted
                                        playsInline
                                        className="mt-4 aspect-video w-full rounded-2xl bg-black object-cover"
                                    />
                                )}
                            </div>

                            <div className="rounded-3xl border border-slate-200 p-5">
                                <h2 className="text-lg font-black">Código o imagen</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Puedes pegar el código, el token completo o importar una captura del QR desde tu computadora.
                                </p>

                                <form onSubmit={submit} className="mt-4 space-y-3">
                                    <input
                                        value={form.data.value}
                                        onChange={(e) => form.setData('value', e.target.value)}
                                        placeholder="EVT-... o token QR"
                                        className="w-full rounded-xl border-slate-200"
                                    />

                                    <button
                                        disabled={form.processing}
                                        className="w-full rounded-xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700 disabled:opacity-60"
                                    >
                                        {form.processing ? 'Validando...' : 'Validar entrada'}
                                    </button>
                                </form>

                                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-200 px-4 py-3 text-sm font-black text-violet-700 transition hover:bg-violet-50">
                                    <PhotoIcon className="h-5 w-5" />
                                    {readingImage ? 'Leyendo imagen...' : 'Importar imagen con QR'}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
                                        onChange={(e) => {
                                            scanImage(e.target.files?.[0]);
                                            e.target.value = '';
                                        }}
                                        className="hidden"
                                    />
                                </label>

                                {form.errors.value && (
                                    <p className="mt-3 text-sm font-bold text-red-600">
                                        {form.errors.value}
                                    </p>
                                )}

                                {message && (
                                    <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                        {message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {result && (
                            <div
                                className={`mt-6 rounded-3xl border p-6 ${
                                    result.ok
                                        ? 'border-emerald-200 bg-emerald-50'
                                        : 'border-red-200 bg-red-50'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {result.ok ? (
                                        <CheckCircleIcon className="h-12 w-12 shrink-0 text-emerald-600" />
                                    ) : (
                                        <XCircleIcon className="h-12 w-12 shrink-0 text-red-600" />
                                    )}

                                    <div>
                                        <h3
                                            className={`text-xl font-black ${
                                                result.ok ? 'text-emerald-800' : 'text-red-800'
                                            }`}
                                        >
                                            {result.message}
                                        </h3>

                                        {result.code && (
                                            <p className="mt-2 font-mono text-sm">{result.code}</p>
                                        )}
                                        {result.event && (
                                            <p className="mt-2 font-bold">
                                                {result.event} · {result.type}
                                            </p>
                                        )}
                                        {result.holder && (
                                            <p className="text-sm">Titular: {result.holder}</p>
                                        )}
                                        {result.usedAt && (
                                            <p className="text-sm">Usada: {result.usedAt}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h2 className="text-lg font-black">Validaciones recientes</h2>

                        <div className="mt-4 space-y-3">
                            {recent.length ? (
                                recent.map((entry, index) => (
                                    <div
                                        key={`${entry.code}-${index}`}
                                        className="rounded-2xl border border-slate-100 p-4"
                                    >
                                        <div className="flex justify-between gap-3">
                                            <p className="font-black text-slate-800">{entry.event}</p>
                                            <span className="text-xs font-bold text-emerald-600">
                                                {entry.usedAt}
                                            </span>
                                        </div>
                                        <p className="mt-1 font-mono text-xs text-violet-700">
                                            {entry.code}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">{entry.holder}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400">Sin validaciones recientes.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
