import { NotificareNotification } from '@notificare/core';

export async function createMapContent(notification: NotificareNotification): Promise<HTMLElement> {
  const content = notification.content.filter(({ type }) => type === 're.notifica.content.Marker');
  if (!content.length) throw new Error(`Invalid content for notification '${notification.type}'.`);

  if (typeof window.google === 'undefined' || !google || !google.maps) {
    throw new Error('Google Maps library could not be found.');
  }

  const mapContainer = document.createElement('div');
  mapContainer.classList.add('notificare__notification-map');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const { Map } = await google.maps.importLibrary('maps');

  const map = new Map(mapContainer, {
    zoom: 15,
    center: {
      lat: content[0].data.latitude,
      lng: content[0].data.longitude,
    },
  });

  const markers = content.map(({ data }) => {
    const marker = new google.maps.Marker({
      map,
      position: {
        lat: data.latitude,
        lng: data.longitude,
      },
    });

    if (data.title || data.description) {
      const infoWindowContent = document.createElement('div');
      infoWindowContent.classList.add('notificare__notification-map-info-window');

      if (data.title) {
        const title = document.createElement('h2');
        title.classList.add('notificare__notification-map-info-window-title');
        title.innerHTML = data.title;
        infoWindowContent.appendChild(title);
      }

      if (data.description) {
        const description = document.createElement('p');
        description.classList.add('notificare__notification-map-info-window-description');
        description.innerHTML = data.description;
        infoWindowContent.appendChild(description);
      }

      const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent,
      });

      marker.addListener('click', () => {
        infoWindow.open({
          anchor: marker,
          map,
        });
      });
    }

    return marker;
  });

  if (markers.length > 1) {
    const bounds = new google.maps.LatLngBounds();
    markers.forEach((marker) => {
      const position = marker.getPosition();
      if (position) bounds.extend(position);
    });

    map.fitBounds(bounds);
  }

  return mapContainer;
}
