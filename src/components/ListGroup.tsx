// src/components/ListGroup.tsx

interface Activity {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  items: Activity[]; // Changed from string[] to Activity[]
  heading: string;
  onSelectItem: (activity: Activity) => void; 
}

function ListGroup({ items, heading, onSelectItem }: Props) {
  return (
    <>
      <h1>{heading}</h1>
      <ul className="list-group">
        {items.map((item) => (
          <li
            key={item.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            onClick={() => onSelectItem(item)}
            style={{ cursor: 'pointer' }}
          >
            <span>{item.icon} {item.name}</span>
            <span className="badge bg-primary rounded-pill">Log</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;