import "./ActionButtons.scss"

export function ActionButtons({ onEdit, onDelete }) {

  return (
    <div id="action-buttons">
      <button
        title="Επεξεργασία γραμμής"
        className="button-edit"
        onClick={onEdit}
        style={{ marginRight: 7 }}
      >
        <span className="dashicons dashicons-edit"></span>
      </button>

      <button
        title="Διαγραφή γραμμής"
        className="button-delete"
        onClick={onDelete}
      >
        <span class="dashicons dashicons-trash"></span>
      </button>
    </div>
  )
}