document.addEventListener('DOMContentLoaded', function () {
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const leadsBody = document.getElementById('leadsBody');
  const searchInput = document.getElementById('searchInput');
  const exportBtn = document.getElementById('exportBtn');
  const refreshBtn = document.getElementById('refreshBtn');

  let allLeads = [];

  // Check if already authenticated
  checkAuth();

  async function checkAuth() {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        showDashboard();
        const leads = await res.json();
        allLeads = leads;
        renderLeads(leads);
        updateStats(leads);
      }
    } catch {
      // Not authenticated, show login
    }
  }

  // Login
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    loginBtn.disabled = true;
    loginBtn.textContent = 'Ingresando...';
    loginError.style.display = 'none';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('loginEmail').value,
          password: document.getElementById('loginPassword').value
        })
      });

      if (res.ok) {
        showDashboard();
        loadLeads();
      } else {
        const data = await res.json();
        loginError.textContent = data.error || 'Credenciales inválidas';
        loginError.style.display = 'block';
      }
    } catch {
      loginError.textContent = 'Error de conexión';
      loginError.style.display = 'block';
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Iniciar sesión';
  });

  // Logout
  logoutBtn.addEventListener('click', async function () {
    await fetch('/api/admin/logout', { method: 'POST' });
    dashboard.style.display = 'none';
    loginScreen.style.display = 'flex';
  });

  // Load leads
  async function loadLeads() {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const leads = await res.json();
        allLeads = leads;
        renderLeads(leads);
        updateStats(leads);
      } else if (res.status === 401) {
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
      }
    } catch {
      leadsBody.innerHTML = '<tr><td colspan="8" class="empty-state">Error al cargar leads</td></tr>';
    }
  }

  // Render leads table
  function renderLeads(leads) {
    if (leads.length === 0) {
      leadsBody.innerHTML = '<tr><td colspan="8" class="empty-state">No hay leads registrados aún</td></tr>';
      return;
    }

    leadsBody.innerHTML = leads.map(function (lead) {
      var date = new Date(lead.created_at + 'Z');
      var formatted = date.toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      return '<tr>' +
        '<td>' + lead.id + '</td>' +
        '<td><strong>' + escapeHtml(lead.nombre) + '</strong></td>' +
        '<td>' + escapeHtml(lead.email) + '</td>' +
        '<td>' + escapeHtml(lead.telefono || '-') + '</td>' +
        '<td>' + escapeHtml(lead.negocio || '-') + '</td>' +
        '<td class="msg-cell" title="' + escapeAttr(lead.mensaje || '') + '">' + escapeHtml(lead.mensaje || '-') + '</td>' +
        '<td class="date-cell">' + formatted + '</td>' +
        '<td><button class="btn-danger-sm" onclick="deleteLead(' + lead.id + ')">Eliminar</button></td>' +
        '</tr>';
    }).join('');
  }

  // Update stats
  function updateStats(leads) {
    document.getElementById('totalLeads').textContent = leads.length;

    var now = new Date();
    var todayStr = now.toISOString().split('T')[0];
    var weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    var todayCount = 0;
    var weekCount = 0;
    leads.forEach(function (lead) {
      var leadDate = new Date(lead.created_at + 'Z');
      if (leadDate.toISOString().split('T')[0] === todayStr) todayCount++;
      if (leadDate >= weekAgo) weekCount++;
    });

    document.getElementById('todayLeads').textContent = todayCount;
    document.getElementById('weekLeads').textContent = weekCount;
  }

  // Search
  searchInput.addEventListener('input', function () {
    var query = this.value.toLowerCase();
    var filtered = allLeads.filter(function (lead) {
      return lead.nombre.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.negocio && lead.negocio.toLowerCase().includes(query));
    });
    renderLeads(filtered);
  });

  // Export CSV
  exportBtn.addEventListener('click', function () {
    window.location.href = '/api/leads/export/csv';
  });

  // Refresh
  refreshBtn.addEventListener('click', function () {
    loadLeads();
  });

  // Delete lead
  window.deleteLead = async function (id) {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    try {
      const res = await fetch('/api/leads/' + id, { method: 'DELETE' });
      if (res.ok) loadLeads();
    } catch {
      alert('Error al eliminar');
    }
  };

  function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'block';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});
