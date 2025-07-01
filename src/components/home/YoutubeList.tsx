import React from 'react';

interface YouTubePlaylistProps {
  name: string;
  playlistId: string;
  height?: string;
  width?: string;
}

export const YoutubeList = ({
  name,
  playlistId,
  height = '280px',
  width = '100%',
}: YouTubePlaylistProps) => {
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

  return (
    <div className="w-full justify-center my-4 ">
      
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        title="YouTube Playlist"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-xl shadow-lg border-purple-500 border-2"
      />
      <h3 className='uppercase text-2xl font-bold mt-4 text-center'>{name}</h3>
    </div>
  );
};


