// ============================================================
//  PLASTIMON SYS — shared/db.js
//  Capa de datos única · Estructura productos + variantes
//  Dos Tercios Studio · Abril 2026
// ============================================================

const SUPABASE_URL      = 'https://hjdjgzksmozyoahecyya.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZGpnemtzbW96eW9haGVjeXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjgyMjIsImV4cCI6MjA4OTcwNDIyMn0.4rgBhPKVieMugOx2TjiAYjsQt0FSx3Gz-llIW6LSjfA';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hoy() { return new Date().toISOString().split('T')[0]; }

// ── Helpers de formato ────────────────────────────────────────
function formatPrecio(n) {
  if (!n && n !== 0) return '—';
  return '$' + new Intl.NumberFormat('es-AR').format(Math.round(n));
}

function formatFecha(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const DB = {

  // ── CATEGORÍAS ───────────────────────────────────────────────
  categorias: {
    getAll: () =>
      sb.from('categorias').select('*').eq('activo', true).order('orden'),
  },

  // ── PRODUCTOS ────────────────────────────────────────────────
  productos: {
    // Todos los productos con sus variantes y categoría
    getAll: () =>
      sb.from('productos')
        .select('*, categoria:categorias(nombre), variantes(*)')
        .eq('activo', true)
        .order('nombre'),

    // Un producto con todas sus variantes
    getById: (id) =>
      sb.from('productos')
        .select('*, categoria:categorias(nombre), variantes(*)')
        .eq('id', id)
        .single(),

    // Búsqueda por nombre de producto o variante
    search: (q) =>
      sb.from('productos')
        .select('*, categoria:categorias(nombre), variantes(*)')
        .eq('activo', true)
        .ilike('nombre', `%${q}%`)
        .order('nombre')
        .limit(20),

    // Productos por categoría con variantes
    getByCategoria: (categoriaId) =>
      sb.from('productos')
        .select('*, variantes(*)')
        .eq('activo', true)
        .eq('categoria_id', categoriaId)
        .order('nombre'),

    save: (data) =>
      sb.from('productos').upsert(data).select().single(),

    remove: (id) =>
      sb.from('productos').update({ activo: false }).eq('id', id),
  },

  // ── VARIANTES ────────────────────────────────────────────────
  variantes: {
    getAll: () =>
      sb.from('variantes')
        .select('*, producto:productos(nombre, categoria:categorias(nombre))')
        .eq('activo', true)
        .order('nombre'),

    getById: (id) =>
      sb.from('variantes')
        .select('*, producto:productos(nombre, categoria:categorias(nombre))')
        .eq('id', id)
        .single(),

    // Variantes de un producto específico
    getByProducto: (productoId) =>
      sb.from('variantes')
        .select('*')
        .eq('producto_id', productoId)
        .eq('activo', true)
        .order('nombre'),

    // Búsqueda para el módulo de ventas (busca en nombre de variante y producto)
    searchParaVenta: async (q) => {
      const { data, error } = await sb.from('variantes')
        .select('*, producto:productos(id, nombre, categoria:categorias(nombre))')
        .eq('activo', true)
        .ilike('nombre', `%${q}%`)
        .order('nombre')
        .limit(30);
      return { data, error };
    },

    save: (data) =>
      sb.from('variantes').upsert(data).select().single(),

    remove: (id) =>
      sb.from('variantes').update({ activo: false }).eq('id', id),

    // Actualizar stock directamente
    updateStock: (id, nuevoStock) =>
      sb.from('variantes').update({ stock_actual: nuevoStock }).eq('id', id),

    // Registrar movimiento y actualizar stock
    movimiento: async (varianteId, tipo, cantidad, motivo, pedidoId = null) => {
      // 1. Obtener stock actual
      const { data: v, error } = await sb
        .from('variantes').select('stock_actual').eq('id', varianteId).single();
      if (error) return { error };

      // 2. Calcular nuevo stock
      const delta     = tipo === 'entrada' ? cantidad : -cantidad;
      const nuevoStock = (v.stock_actual || 0) + delta;

      // 3. Actualizar stock + registrar movimiento en paralelo
      const [r1, r2] = await Promise.all([
        sb.from('variantes').update({ stock_actual: nuevoStock }).eq('id', varianteId),
        sb.from('movimientos_stock').insert({
          variante_id: varianteId,
          tipo,
          cantidad,
          motivo,
          pedido_id: pedidoId,
        }),
      ]);

      return r1.error ? { error: r1.error } : r2;
    },

    historialMovimientos: (varianteId) =>
      sb.from('movimientos_stock')
        .select('*')
        .eq('variante_id', varianteId)
        .order('fecha', { ascending: false })
        .limit(50),
  },

  // ── PROVEEDORES ─────────────────────────────────────────────
  proveedores: {
    getAll:  ()   => sb.from('proveedores').select('*').eq('activo', true).order('nombre'),
    getById: (id) => sb.from('proveedores').select('*').eq('id', id).single(),
    save:    (d)  => sb.from('proveedores').upsert(d).select().single(),
    remove:  (id) => sb.from('proveedores').update({ activo: false }).eq('id', id),
  },

  // ── CLIENTES ─────────────────────────────────────────────────
  clientes: {
    getAll: () =>
      sb.from('clientes').select('*').eq('activo', true).order('nombre'),

    getById: (id) =>
      sb.from('clientes').select('*').eq('id', id).single(),

    search: (q) =>
      sb.from('clientes')
        .select('*').eq('activo', true)
        .ilike('nombre', `%${q}%`)
        .order('nombre').limit(20),

    save: (data) =>
      sb.from('clientes').upsert(data).select().single(),

    remove: (id) =>
      sb.from('clientes').update({ activo: false }).eq('id', id),

    historial: (clienteId) =>
      sb.from('pedidos')
        .select('*, items:pedido_items(*, variante:variantes(nombre, producto:productos(nombre)))')
        .eq('cliente_id', clienteId)
        .order('fecha', { ascending: false })
        .limit(20),
  },

  // ── PEDIDOS ──────────────────────────────────────────────────
  pedidos: {
    getAll: () =>
      sb.from('pedidos')
        .select('*, cliente:clientes(nombre, telefono), items:pedido_items(*, variante:variantes(nombre, unidad_base, producto:productos(nombre)))')
        .order('created_at', { ascending: false }),

    getById: (id) =>
      sb.from('pedidos')
        .select('*, cliente:clientes(*), items:pedido_items(*, variante:variantes(*, producto:productos(nombre)))')
        .eq('id', id)
        .single(),

    getHoy: () =>
      sb.from('pedidos')
        .select('*, cliente:clientes(nombre), items:pedido_items(cantidad, precio_unitario)')
        .eq('fecha', hoy()),

    getByVendedor: (uid) =>
      sb.from('pedidos')
        .select('*, cliente:clientes(nombre)')
        .eq('vendedor_id', uid)
        .order('created_at', { ascending: false }),

    save: (data) =>
      sb.from('pedidos').upsert(data).select().single(),

    updateEstado: (id, estado) =>
      sb.from('pedidos').update({ estado }).eq('id', id),

    // Crear pedido completo: pedido + items + descuento de stock
    crear: async (clienteId, vendedorId, items, notas = '') => {
      // items = [{ variante_id, cantidad, precio_unitario, tipo_precio }]
      const total = items.reduce((a, i) => a + i.cantidad * i.precio_unitario, 0);

      // 1. Crear pedido
      const { data: pedido, error: e1 } = await sb.from('pedidos').insert({
        cliente_id:  clienteId,
        vendedor_id: vendedorId,
        fecha:       hoy(),
        estado:      'borrador',
        total,
        notas,
      }).select().single();
      if (e1) return { error: e1 };

      // 2. Insertar items
      const { error: e2 } = await sb.from('pedido_items').insert(
        items.map(i => ({ ...i, pedido_id: pedido.id }))
      );
      if (e2) return { error: e2 };

      // 3. Descontar stock de cada variante
      for (const item of items) {
        await DB.variantes.movimiento(
          item.variante_id,
          'salida',
          item.cantidad,
          `Pedido #${pedido.id.slice(0, 8)}`,
          pedido.id
        );
      }

      return { data: pedido };
    },
  },

  // ── RUTAS ────────────────────────────────────────────────────
  rutas: {
    getHoy: (vendedorId) =>
      sb.from('rutas')
        .select('*, paradas(*, cliente:clientes(nombre, telefono, direccion, lat, lng))')
        .eq('vendedor_id', vendedorId)
        .eq('fecha', hoy())
        .maybeSingle(),

    crear: (vendedorId) =>
      sb.from('rutas').insert({
        vendedor_id: vendedorId,
        fecha:       hoy(),
        estado:      'planificada',
      }).select().single(),

    updateEstado:    (id, e) => sb.from('rutas').update({ estado: e }).eq('id', id),
    saveParada:      (data)  => sb.from('paradas').upsert(data).select().single(),
    marcarEntregado: (id)    => sb.from('paradas').update({ estado: 'entregado' }).eq('id', id),
    eliminarParada:  (id)    => sb.from('paradas').delete().eq('id', id),
  },

  // ── MÉTRICAS ─────────────────────────────────────────────────
  metricas: {
    ventasHoy: async () => {
      const { data } = await sb.from('pedidos')
        .select('total').eq('fecha', hoy()).not('estado', 'eq', 'cancelado');
      return (data || []).reduce((a, p) => a + (p.total || 0), 0);
    },

    pedidosHoy: async () => {
      const { count } = await sb.from('pedidos')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', hoy()).not('estado', 'eq', 'cancelado');
      return count || 0;
    },

    // Variantes con stock por debajo del mínimo
    variantesConAlerta: async () => {
      const { data } = await sb.from('variantes')
        .select('id, nombre, stock_actual, stock_minimo, producto:productos(nombre)')
        .eq('activo', true);
      return (data || []).filter(v => v.stock_actual <= v.stock_minimo);
    },

    // Margen de un pedido (requiere costo_unitario cargado en variantes)
    margenPedido: async (pedidoId) => {
      const { data } = await sb.from('pedido_items')
        .select('cantidad, precio_unitario, variante:variantes(costo_unitario)')
        .eq('pedido_id', pedidoId);
      if (!data) return null;
      const venta = data.reduce((a, i) => a + i.cantidad * i.precio_unitario, 0);
      const costo = data.reduce((a, i) => a + i.cantidad * (i.variante?.costo_unitario || 0), 0);
      return { venta, costo, margen: venta - costo, pct: costo > 0 ? ((venta - costo) / venta) * 100 : null };
    },
  },

  // ── UTILS ────────────────────────────────────────────────────
  fmt: { precio: formatPrecio, fecha: formatFecha },
};

window.DB = DB;
window.sb = sb;