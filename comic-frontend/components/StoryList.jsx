import { useEffect, useState } from 'react';

function StoryList() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/stories') // tùy port backend
      .then(res => res.json())
      .then(data => setStories(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {stories.map(story => (
        <div key={story._id} className="bg-white rounded shadow p-4">
          <h2 className="font-bold text-lg">{story.title}</h2>
          <p>{story.description}</p>
        </div>
      ))}
    </div>
  );
}

export default StoryList;
