import { useEffect, useState } from 'react';
import dayjs from 'dayjs'
import './App.css'

const DAILY_TAG_CACHE_KEY = 'danbooru-daily-tags';
const DAILY_IMAGE_CACHE_KEY = 'danbooru-daily-image';

function getTodayKey() {
  return dayjs().format('YYYY-MM-DD');
}

async function fetchDailyPost() {
  const cachedKey = getTodayKey();
  const cachedTags = localStorage.getItem(`${DAILY_TAG_CACHE_KEY}-${cachedKey}`);
  const cachedImage = localStorage.getItem(`${DAILY_IMAGE_CACHE_KEY}-${cachedKey}`);

  if (cachedTags && cachedImage) {
    return {
      tags: JSON.parse(cachedTags),
      imageUrl: cachedImage
    };
  }

  const res = await fetch(`https://danbooru.donmai.us/posts.json?limit=1&random=true&tags=-filetype:video score:>10 rating:g`);
  const [post] = await res.json();
  const imageUrl = post.large_file_url;

  const allTags = [
    ...post.tag_string_general.split(' '),
    ...post.tag_string_character.split(' '),
    ...post.tag_string_artist.split(' '),
    ...post.tag_string_copyright.split(' ')
  ];

  const tagCounts = await Promise.all(allTags.map(async (tag) => {
    const res = await fetch(`http://localhost:3001/api/tag/${tag}`);
    const json = await res.json();
    return {
      tag,
      count: json[0]?.post_count || 1
    };
  }));

  const inverseWeights = tagCounts.map(t => 1 / t.count);
  const totalWeight = inverseWeights.reduce((a, b) => a + b, 0);

  const scoredTags = tagCounts.map((t, i) => ({
    tag: t.tag,
    points: Math.round((inverseWeights[i] / totalWeight) * 1000)
  }));

  localStorage.setItem(`${DAILY_TAG_CACHE_KEY}-${cachedKey}`, JSON.stringify(scoredTags));
  localStorage.setItem(`${DAILY_IMAGE_CACHE_KEY}-${cachedKey}`, imageUrl);

  console.log(post);
  console.log(allTags);

  return { tags: scoredTags, imageUrl };
}

function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [tagList, setTagList] = useState([]);
  const [guessedTags, setGuessedTags] = useState([]);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Start guessing!');
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleDoneClick = () => {
    setIsPopupVisible(true);
  };

  useEffect(() => {
    fetchDailyPost().then(({ tags, imageUrl }) => {
      console.log(imageUrl);
      setTagList(tags);
      setImageUrl(imageUrl);
    });
  }, []);

  const handleGuess = (e) => {
    e.preventDefault();
    const cleanGuess = guess.trim().toLowerCase().replace(/ /g, '_');
    if (!cleanGuess) return;

    if (guessedTags.includes(cleanGuess)) {
      setFeedback('You already guessed that!');
    } else {
      const match = tagList.find(t => t.tag.toLowerCase() === cleanGuess);
      if (match) {
        setGuessedTags([...guessedTags, cleanGuess]);
        setScore(score + match.points);
        setFeedback(`Correct! +${match.points} points`);
      } else {
        setFeedback('Incorrect guess.');
      }
    }
    setGuess('');
  }

  const handleHintClick = () => {
    const unguessedTags = tagList.filter(tag => !guessedTags.includes(tag.tag));
    if (unguessedTags.length === 0) {
      setFeedback("No more unguessed tags left!");
      return;
    }
  
    const randomTag = unguessedTags[Math.floor(Math.random() * unguessedTags.length)].tag;
    setGuess(randomTag);
    setScore(score - 10);
    setFeedback(`Hint: "${randomTag}" has been autofilled. -10 points.`);
  };

  const getNextResetTime = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight
    
    const remainingTime = nextMidnight - now; // Time remaining in milliseconds
    
    const hours = Math.floor(remainingTime / 1000 / 60 / 60);
    const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    
    return `${hours} hours ${minutes} minutes ${seconds} seconds`;
  };

  const handleCopyResults = async () => {
    const today = dayjs().format('YYYY-MM-DD');
    let text = `TagGuessr ${today}\n${score} / 1000 Pts`;
    if (score >= 999) {
      text += '\nPerfect 🎉';
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.log('Failed to copy.');
    }
  };

  return (
    <div className="min-h-screen bg-[#eeeaea]">
      {/* Popup */}
      {isPopupVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-bold text-center">Your Progress</h2>

            <div className="mt-4">
              <p className="text-xl">Your Score: {score} / 1000</p>
              {score >= 999 && (
                <p className="mt-2 text-center text-green-600 text-xl font-semibold">
                  🎉 Perfect! 🎉
                </p>
              )}
              <p className="text-xl mt-4">Historical Perfects: 0</p>
            </div>

            <p className="text-lg mt-4">
              Next Image Reset: {getNextResetTime()}
            </p>

            <button
              onClick={handleCopyResults}
              className="mt-4 py-2 px-4 bg-[#704fb9] text-white rounded-md w-full hover:bg-[#5d42a0] focus:ring-2 focus:ring-[#3d276e]"
            >
              Copy Results
            </button>

            <button
              onClick={() => setIsPopupVisible(false)}
              className="mt-4 py-2 px-4 bg-[#1e1e1e] text-white rounded-md w-full"
            >
              Close
            </button>

            <p className="text-sm text-gray-500 mt-5">
              Note: You can keep playing until the next reset. Score resets at midnight
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full bg-[#f3ddaa] py-4">
        <h1 className="text-[#704fb9] text-5xl font-bold text-center tracking-wider">TAGGUESSR</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 items-start">
        {/* Image Container */}
        <div className="border-4 border-black border-solid p-0 bg-[#f3ddaa] overflow-hidden shrink-0">
          <div className="w-[512px] h-[512px] overflow-hidden flex items-center justify-center">
            {imageUrl ? (
              <img src={imageUrl} alt="Image" className="max-h-full max-w-full object-contain"/>
            ) : (
              <p>Loading image...</p>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#1e1e1e]">Guess the tags!</h2>

          {/* Score Display */}
          <div className="mt-4">
            <p className="text-6xl font-bold text-[#1e1e1e]">
              {score}<span className="text-4xl font-normal"> 
                {" / 1000 Pts"}{score === 1000 ? " 🎉" : ""}
              </span>
            </p>
          </div>

          <p className="bg-[#cff7d3] inline-block px-4 py-2 rounded-full text-[#02542d]">
            {feedback}
          </p>

          {/* Guess Field */}
          <form className="flex items-center space-x-2" onSubmit={handleGuess}>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Guess a tag..."
              className="flex-1 py-2 px-4 text-lg text-[#1e1e1e] bg-[#fff] border border-[#ddd] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#704fb9] focus:border-[#704fb9]"
            />
            <button type="submit" className="py-2 px-8 bg-[#704fb9] text-white rounded-medium hover:bg-[#5d42a0] focus:ring-2 focus:ring-[#3d276e]">
              Guess
            </button>
            <button
              type="button"
              onClick={handleHintClick}
              className="py-2 px-8 bg-yellow-500 text-white rounded-medium hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
            >
              Hint
            </button>
          </form>

          {/* Done Button */}
          <button type="submit" onClick={handleDoneClick} className="w-full py-4 bg-[#1e1e1e] hover:bg-[#2c2c2c] text-white rounded-xl">
            I'm Done
          </button>

          {/* Correct Guesses list */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Correct Guesses</h3>
            <p className="text-[#1e1e1e]">
              {guessedTags.map((tag, index) => (
                <li key={index}>{tag}</li>
              ))}
            </p>
          </div>

          {/* Super Stylish and Helpful Help Box */}
          <div className="bg-sky-100 border-l-4 border-[#704fb9] p-4 rounded shadow-md mt-4 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[#704fb9] text-center">
                The Super Helpful Help Box
              </h3>
              <button
                onClick={() => setHelpExpanded(!helpExpanded)}
                className="absolute right-2 top-4 text-xs px-2 py-1 border border-[#704fb9] text-[#704fb9] bg-white rounded hover:bg-[#704fb9] hover:text-white transition"
              >
                {helpExpanded ? "hide" : "show"}
              </button>
            </div>
            
            {helpExpanded && (
              <div>
                <p className="text-sm text-gray-700">
                  Tags can be anything you see in the image! <br />
                  Anything from literal objects (a cup of coffee, try "cup"/"coffee"),
                  to more abstract concepts (one male character, it's probably "1boy"). <br />
                </p>
                <p className="text-sm text-gray-700 mt-4">
                  <strong>Helpful tip 1:</strong> Some tags end with parentheses, especially character tags. For instance: <br />
                  "fate (series)" <br />
                  "mizuki (arknights)" <br />
                  "tomoe (symbol)" <br />
                </p>
                <p className="text-sm text-gray-700 mt-4">
                  <strong>Disclaimer:</strong> Some images may be poorly tagged. That's neither of our fault!
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}


export default App
