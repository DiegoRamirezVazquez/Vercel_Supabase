"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);

  async function peticion(metodo, url, body) {
    const inicio = performance.now();
    const opciones = { method: metodo };

    if (body) {
      opciones.headers = { "Content-Type": "application/json" };
      opciones.body = JSON.stringify(body);
    }

    const res = await fetch(url, opciones);
    const texto = await res.text();

    let data = null;

    try {
      data = texto ? JSON.parse(texto) : null;
    } catch {
      data = texto;
    }

    const ms = Math.round(performance.now() - inicio);

    setLogs((prev) =>
      [
        {
          hora: new Date().toLocaleTimeString(),
          metodo,
          url,
          body,
          status: res.status,
          ms,
          respuesta: data,
        },
        ...prev,
      ].slice(0, 20)
    );

    return { res, data };
  }

  async function cargar() {
    const { res, data } = await peticion("GET", "/api/tareas");

    if (!res.ok) {
      return setError(data?.error || "Error al cargar las tareas");
    }

    setError("");
    setTareas(data);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e) {
    e.preventDefault();

    if (!titulo.trim()) return;

    const { res, data } = await peticion("POST", "/api/tareas", {
      titulo,
    });

    if (!res.ok) {
      return setError(data?.error || "Error al crear la tarea");
    }

    setTitulo("");
    cargar();
  }

  async function alternar(tarea) {
    await peticion("PUT", `/api/tareas/${tarea.id}`, {
      completada: !tarea.completada,
    });

    cargar();
  }

  async function eliminar(id) {
    await peticion("DELETE", `/api/tareas/${id}`);
    cargar();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 text-neutral-900">
      <div className="mx-auto max-w-xl">

        {/* Encabezado */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            PREVIEW DEPLOYMENT
          </div>

          <h1 className="text-3xl font-bold">
            🚀 Prueba de deploy
          </h1>

          <p className="mt-2 text-sm text-blue-100">
            Aplicación de tareas con Next.js, Supabase y Vercel
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={crear}
          className="mb-6 flex gap-2 rounded-xl bg-white p-4 shadow-md"
        >
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Escribe una nueva tarea..."
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />

          <button
            className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            Agregar
          </button>
        </form>

        {error && (
          <p className="mb-3 rounded-lg bg-red-100 p-3 text-red-600">
            {error}
          </p>
        )}

        {/* Lista de tareas */}
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold">
            📋 Mis tareas
          </h2>

          <ul className="space-y-3">
            {tareas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-md transition hover:shadow-lg"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={t.completada}
                    onChange={() => alternar(t)}
                    className="h-5 w-5 accent-blue-600"
                  />

                  <span
                    className={
                      t.completada
                        ? "text-neutral-400 line-through"
                        : "font-medium"
                    }
                  >
                    {t.titulo}
                  </span>
                </label>

                <button
                  onClick={() => eliminar(t.id)}
                  className="font-medium text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          {tareas.length === 0 && (
            <p className="rounded-xl bg-white p-4 text-center text-neutral-500 shadow">
              No hay tareas todavía.
            </p>
          )}
        </section>

        {/* Consola */}
        <section className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">
              🖥️ Consola de peticiones
            </h2>

            <button
              onClick={() => setLogs([])}
              className="text-sm text-neutral-600 underline hover:text-black"
            >
              Limpiar
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-lg bg-neutral-900 p-3 font-mono text-xs text-neutral-100">
            {logs.length === 0 && (
              <p className="text-neutral-400">
                Sin peticiones todavía.
              </p>
            )}

            {logs.map((l, i) => (
              <div
                key={i}
                className="mb-3 border-b border-neutral-700 pb-2"
              >
                <p>
                  <span className="text-neutral-400">
                    {l.hora}
                  </span>{" "}
                  <span className="font-bold text-yellow-300">
                    {l.metodo}
                  </span>{" "}
                  {l.url}{" "}
                  <span
                    className={
                      l.status < 400
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {l.status}
                  </span>{" "}
                  <span className="text-neutral-400">
                    {l.ms} ms
                  </span>
                </p>

                {l.body && (
                  <pre className="mt-1 whitespace-pre-wrap text-blue-300">
                    Solicitud: {JSON.stringify(l.body, null, 2)}
                  </pre>
                )}

                <pre className="mt-1 whitespace-pre-wrap">
                  Respuesta:{" "}
                  {l.respuesta
                    ? JSON.stringify(l.respuesta, null, 2)
                    : "(vacía)"}
                </pre>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}