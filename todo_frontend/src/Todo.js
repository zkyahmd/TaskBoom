import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Todo() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(-1);

   //Edit
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [filter, setFilter] = useState("all");

  const apiUrl = "http://localhost:8000";

  const handleSubmit = () => {
    setError("");

    //check inputs
    if (title.trim() !== '' && description.trim() !== '') {
      fetch(apiUrl + "/todos", {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ title, description, completed: false })
      }).then((res) => {
        if (res.ok) {
          setTodos([...todos, { title, description, completed: false }]);
          setTitle("");
          setDescription("");
          setMessage("Item added successfully");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setError("Unable to create todo item!");
        }
      }).catch(() => setError("Unable to create todo item!"));
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  const getItems = () => {
    fetch(apiUrl + "/todos")
      .then((res) => res.json())
      .then((res) => setTodos(res));
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleUpdate = () => {
    setError("");
    //check inputs
    if (editTitle.trim() !== '' && editDescription.trim() !== '') {
      fetch(apiUrl + "/todos/" + editId, {
        method: "PUT",
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ title: editTitle, description: editDescription })
      }).then((res) => {
        if (res.ok) {
          const updatedTodos = todos.map((item) => {
            if (item._id === editId) {
              item.title = editTitle;
              item.description = editDescription;
            }
            return item;
          });
          setTodos(updatedTodos);
          setEditTitle("");
          setEditDescription("");
          setEditId(-1);
          setMessage("Item updated successfully");
          setTimeout(() => setMessage(""), 3000);
        } else {
             //set error
          setError("Unable to update todo item!");
        }
      }).catch(() => setError("Unable to update todo item!"));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete?')) {
      fetch(apiUrl + '/todos/' + id, { method: "DELETE" })
        .then(() => setTodos(todos.filter((item) => item._id !== id)));
    }
  };

  const handleCheckbox = (id) => {
    const target = todos.find(todo => todo._id === id);
    fetch(apiUrl + "/todos/" + id, {
      method: "PUT",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ ...target, completed: !target.completed })
    })
      .then(() => {
        setTodos(todos.map(todo => todo._id === id ? { ...todo, completed: !todo.completed } : todo));
      });
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  return (
    <div style={{ backgroundColor: "#e0f7fa", minHeight: "100vh", paddingBottom: "20px" }} className="container p-3">
      <h1 style={{ backgroundColor: "#d3d3d3", padding: "10px", borderRadius: "5px" }} className="text-center">TaskBoom</h1>

      <div className="my-3">
  <div className="row">
    <div className="col-4 mb-2">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="form-control"
      />
    </div>
    <div className="col-4 mb-2">
      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-control"
      />
    </div>
    <div className="col-4 mb-2">
      <button className="btn btn-dark w-100" onClick={handleSubmit}>Add</button>
    </div>
  </div>
  {message && <p className="text-success mt-2">{message}</p>}
  {error && <p className="text-danger mt-2">{error}</p>}
</div>

<div className="mb-3 d-flex justify-content-around">
  <span
    className="fw-bold cursor-pointer"
    style={{
      color: filter === "all" ? "#007bff" : "", // Highlight "All" filter
      borderBottom: filter === "all" ? "2px solid #007bff" : "" // Underline "All"
    }}
    onClick={() => setFilter("all")}
  >
    All
  </span>
  <span
    className="fw-bold cursor-pointer"
    style={{
      color: filter === "completed" ? "#007bff" : "", // Highlight "Completed" filter
      borderBottom: filter === "completed" ? "2px solid #007bff" : "" // Underline "Completed"
    }}
    onClick={() => setFilter("completed")}
  >
    Completed
  </span>
  <span
    className="fw-bold cursor-pointer"
    style={{
      color: filter === "pending" ? "#007bff" : "", // Highlight "Pending" filter
      borderBottom: filter === "pending" ? "2px solid #007bff" : "" // Underline "Pending"
    }}
    onClick={() => setFilter("pending")}
  >
    Pending
  </span>
</div>

      <ul className="list-group">
        {filteredTodos.map((item) => (
          <li key={item._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={item.completed}
                onChange={() => handleCheckbox(item._id)}
              />
            </div>
            <div className="flex-fill ms-3">
              {editId === item._id ? (
                <>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="form-control mb-1" />
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="form-control" />
                </>
              ) : (
                <>
                  <div className="fw-bold">{item.title}</div>
                  <div>{item.description}</div>
                </>
              )}
            </div>
            <div className="d-flex ms-2">
              {editId === item._id ? (
                <>
                  <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Update</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditId(-1)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn btn-link text-dark me-2" onClick={() => handleEdit(item)}><FaEdit /></button>
                  <button className="btn btn-link text-danger" onClick={() => handleDelete(item._id)}><FaTrash /></button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
