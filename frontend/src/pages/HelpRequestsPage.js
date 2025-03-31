import React, { useEffect, useState } from "react";
import "./HelpRequestsPage.css";

const HelpRequestsPage = () => {
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    heading: "",
    content: "",
    
    author: "",
  });

  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/help/get`);
        if (!response.ok) {
          throw new Error("Failed to fetch help requests");
        }
        const data = await response.json();
        setHelpRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.heading || !formData.content || !formData.author) {
      setError("All fields are required.");
      return;
    }
    setError(null);

    const newHelpRequest = {
      ...formData,
      _id: Date.now().toString(),
      status: "active", 
    };
    setHelpRequests([newHelpRequest, ...helpRequests]);

    setFormData({
      heading: "",
      content: "",
      author: "",
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="help-requests-page">
      <h1>React Assignment</h1>

      <form className="help-request-form" onSubmit={handleSubmit}>
        <div>
          
          <p> The list below is fetched from the database through the FastAPI backend. </p>
          
          <p>The form saves any new data to the existing state of Help Requests.
             It does not save it to the database. It will disappear on reload. </p>
          
          <label>Heading:</label>
          <input
            type="text"
            name="heading"
            value={formData.heading}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Author:</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Add Help Request</button>
      </form>

      {error && <div className="error">{error}</div>}

      <ul className="help-requests-list">
        {helpRequests.map((help) => (
          <li key={help._id} className="help-request-item">
            <h2>{help.heading}</h2>
            <p>{help.content}</p>
            <p><strong>Author:</strong> {help.author}</p>
            <p><strong>Status:</strong> {help.status === "active" ? "Open" : "Closed"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelpRequestsPage;