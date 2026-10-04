function StatCard({ label, value, description, icon: Icon, loading = false }) {
  return (
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-header">
        <span className="dashboard-stat-label">{label}</span>

        {Icon && (
          <div className="dashboard-stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="dashboard-stat-skeleton" />
      ) : (
        <strong className="dashboard-stat-value">{value}</strong>
      )}

      {!loading && description && (
        <span className="dashboard-stat-description">{description}</span>
      )}
    </article>
  );
}

export default StatCard;
