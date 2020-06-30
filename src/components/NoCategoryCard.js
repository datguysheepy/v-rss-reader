import React, { useState, useEffect } from 'react';

import { 
	StyleSheet, 
	View, 
	Text, 
	FlatList,
	TouchableNativeFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import * as rssParser from 'react-native-rss-parser';
import ReadCard from './ReadCard';


const NoCategoryCard = (props) => {
	const [rssObj, set_rssObj] = useState([]);
	const feedsList = props.feedsList || [];
	const [hideCat, set_hideCat] = useState(true);

	
	// hiding or unhiding category handler
	const collapsibleCategory = () => {
		set_hideCat(!hideCat);
	}


	// separator component for Flatlist
	// rendered in between each item, but not at the top or bottom
	const ReadCardSep = () => {
		return (
			<View style={{
				borderBottomWidth: StyleSheet.hairlineWidth,
				borderBottomColor: 'CFD0D3',
				borderStyle: 'solid',
				opacity: 0.2
			}}/>
		)
	};
	
	// header component for FlatList
	// rendered at the top
	const ReadCardHeader = () => {
		return (
			<TouchableNativeFeedback onPress={collapsibleCategory}>
				<View style={styles.CardHeaderWrapper}>

						{
							!hideCat ?
								<Icon name='minus' size={21} />
							: 
								<Icon name='plus' size={21} />
						}

						<Text style={styles.CardHeader}>
							Feeds without category
						</Text>
				</View>
			</TouchableNativeFeedback>
		)
	}

	
	useEffect(() => {
		const fetchRSS = async () => {
			// hacky way to update FlatList data state only when data changes in AsyncStorage
			if(rssObj.length < feedsList.length) {
				// here we fetch every RSS feed in storage
				for(let i=0; i<feedsList.length; i++){
					fetch(feedsList[i].href)
					.then(response => response.text())
					.then(responseData => rssParser.parse(responseData))
					.then((rss) => {
						// max 16 articles per one RSS feed
						// saving every article from RSS feed response to rssObj state
						for(let j=0; j<=16; j++) {
							const RSS = rss.items[j];

							// converting full date from a RSS to: YEAR-MONTH-DAY
							let re = /[0-9]{2}:/;
							let date = RSS.published.split('T')[0];
							re = /[0-9]{2}\ [a-zA-Z]{3}\ [0-9]{4}/;
							date = date.match(re) !== null ? date.match(re)[0] : date;

							// default RSS object to save in a state
							const rssToSave = {
								title: RSS.title,
								date_published: date,
								url: RSS.links[0].url,
								publisher_name: feedsList[i].name,
								categories: RSS.categories[0].name,
							};

							// saving article to state
							set_rssObj(rssObj => [...rssObj, rssToSave]);
						}
					})
					.catch(err => console.log(err))
				}
			}
		}; fetchRSS();
	}, [])
	

	return (
		<View style={styles.CardWrapper}>
			{
				rssObj.length > 0 && !hideCat ?
					<FlatList
						style={{minHeight: '100%'}}
						data = {rssObj}
						keyExtractor={(item, i) => i.toString()}
						renderItem = { ({ item }) => 
							<ReadCard
								title={item.title}
								date_published={item.date_published} 
								url={item.url} 
								publisher_name={item.publisher_name}
								categories={item.categories}
							/> 
						}
						ListHeaderComponent = { ReadCardHeader }
						ItemSeparatorComponent = { ReadCardSep }
					/>
				: <ReadCardHeader />
			}
		</View>
	);
	
}; export default NoCategoryCard;


const styles = StyleSheet.create({
	CardWrapper: {
		backgroundColor: '#fff',
		paddingTop: 8,
		flex: 1
	},

	CardHeaderWrapper: {
		fontSize: 21,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center'
	},

	CardHeader: {
		fontSize: 21,
		fontFamily: 'Muli-SemiBold',
		marginLeft: 4
	},
});