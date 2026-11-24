/**
 * Ícone do Google Material Symbols.
 * Procure o nome do ícone em https://fonts.google.com/icons e use em minúsculas:
 *   <Icon name="local_car_wash" />
 *   <Icon name="calendar_month" filled size={28} />
 */
export function Icon({ name, filled = false, size, className = '' }) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        ...(size && { fontSize: size })
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
