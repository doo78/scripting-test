from bs4 import BeautifulSoup
import requests

source = requests.get('https://www.youtube.com/playlist?list=PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN').text

#with open('simple.html') as html_file:
#soup = BeautifulSoup(html_file, 'lxml')

soup = BeautifulSoup(source, 'lxml')
    
print("\n")
#print(soup.prettify())

# find the first video title and duration
#video_title_and_duration = soup.find('yt-formatted-string', {'class': 'style-scope ytd-video-renderer'})

# extract the duration from the text
#duration_text = video_title_and_duration.text
#duration = duration_text.split(' · ')[1]

#print(duration)
#<div class="badge-shape-wiz__text">4:54</div>
#<div class="thumbnail-overlay-badge-shape style-scope ytd-thumbnail-overlay-time-status-renderer"><badge-shape class="badge-shape-wiz badge-shape-wiz--thumbnail-default badge-shape-wiz--thumbnail-badge" role="img" aria-label="4 minutes, 54 seconds"><div class="badge-shape-wiz__text">4:54</div></badge-shape></div>

from bs4 import BeautifulSoup
import requests

def get_first_video_duration(playlist_url):
    try:
        response = requests.get(playlist_url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

    soup = BeautifulSoup(response.text, 'lxml')
    video_title_and_duration = soup.find('yt-formatted-string', {'class': 'style-scope ytd-video-renderer'})

    if video_title_and_duration:
        duration_element = video_title_and_duration.find_next_sibling('yt-formatted-string')
        if duration_element:
            duration_text = duration_element.text
            duration = duration_text.split(' · ')[1].strip()
            return duration

    return None

playlist_url = 'https://www.youtube.com/playlist?list=PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN'
duration = get_first_video_duration(playlist_url)

if duration:
    print(f"Duration: {duration}")
else:
    print("Failed to extract duration")
    
get_first_video_duration("https://www.youtube.com/playlist?list=PLa5LE8jbn876NFRANd7swmdpo3_3PEqwN")