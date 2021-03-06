import React, { useState, useEffect } from 'react';
import { 
	StyleSheet, 
	View,
	SectionList,
	TouchableNativeFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import * as rssParser from 'react-native-rss-parser';
import ReadCard from './ReadCard';
import styled, { withTheme } from 'styled-components';


const CategoryCard = (props) => {
	const [rssObj, set_rssObj] = useState([]);
	const catList = props.catList || [];
	const [activeCatList, set_activeCatList] = useState([]);
	const [loaded, set_loaded] = useState(false);
	const [refresh, set_refresh] = useState(false);
	const appTheme = props.theme;


	useEffect(() => {
		set_rssObj([]);

		const fetchRSS = async () => {
			// loop every category
			for(let i=0; i<catList.length; i++) {			
				// loop every feed in the category
				for(let j=0; j<catList[i].feeds.length; j++) {
					// default category object to save in a state
					// we're storing feeds in 'data', which is used for SectionList 
					const catToSave = {
						name: catList[i].name + ' / ' + catList[i].feeds[j].name,
						key: catList[i].name + j,
						data: []
					};
					
					fetch(catList[i].feeds[j].href)
					.then(response => response.text())
					.then(responseData => rssParser.parse(responseData))
					.then((rss) => {
						// max 16 articles per one RSS feed
						for(let k=0; k<=16; k++) {
							const RSS = rss.items[k];

							// converting full date from a RSS to: YEAR-MONTH-DAY
							let re = /[0-9]{2}:/;
							let date = RSS.published.split('T')[0];
							re = /[0-9]{2}\ [a-zA-Z]{3}\ [0-9]{4}/;
							date = date.match(re) !== null ? date.match(re)[0] : date;

							// default RSS object to save in a state
							const rssToSave = {
								title: RSS.title,
								date_published: date || '',
								url: RSS.links[0].url,
								publisher_name: catList[i].feeds[j].name || '',
								categories: RSS.categories[0].name || '',
							};

							

							// pushing article to an array of feeds for a category
							catToSave.data.push(rssToSave);
						}
					})
					.catch(err => console.log(err))

					// saving all categories (with feeds data) to a state
					set_rssObj(rssObj => [...rssObj, catToSave]);
				}
			}
		}; fetchRSS();
	}, [catList])

	
	// separator between every article within SectionList
	const ReadCardSep = () => {
		return (
			<View style={{
				borderBottomWidth: StyleSheet.hairlineWidth,
				borderBottomColor: appTheme.BORDER,
				borderStyle: 'solid'
			}}/>
		)
	};


	// header at the top of every section within SectionList
	// [Category Name] / [Feed Name]
	const ReadCardHeader = (name, keyName) => {
		const INDEX = activeCatList.indexOf(keyName);
		
		return (
			<TouchableNativeFeedback 
				onPress={() => {
					if(!props.editActive) {
						collapsibleCategory(keyName);

					} else {
						// collapsing all categories when edit mode is active
						set_activeCatList([]);
						set_refresh(!refresh);

						props.longPressHandler(name);
					}
				}}
				onLongPress={() => {
					// collapsing all categories when edit mode is active
					set_activeCatList([]);
					props.longPressHandler(name)
				}}
				background={TouchableNativeFeedback.Ripple(appTheme.BORDER, false)}
			>
				<HeaderWrapper style={{
					backgroundColor: props.editList.includes(name)
					? appTheme.SEC_BRAND
					: appTheme.MAIN_BG
				}}>
					{
						INDEX > -1 ?
							<Icon name='minus' size={21} color={appTheme.MAIN_TEXT}/>
						: 
							<Icon name='plus' size={21} color={appTheme.MAIN_TEXT}/>
								
					}

					<Header>
						{name}
					</Header>
				</HeaderWrapper>
			</TouchableNativeFeedback>
		)
	}


	// onPress handler for sections from SectionList
	// add keyName to an array of active categories
	// or delete it from there  
	const collapsibleCategory = (keyName) => {
		// search if passed keyName is in an activeCatList state
		// indexOf() returns index of that element, or -1 when not find
		const INDEX = activeCatList.indexOf(keyName);
		if(INDEX > -1){
			// deleting passed keyName from active category list
			activeCatList.splice(INDEX, 1);
		} else {
			// pushing passed keyName to active category list
			activeCatList.push(keyName);
		}

		// changing this state, so Home screen refreshes
		// by doing that SectionList can be rendered again, with activeCatList into account
		set_refresh(!refresh);
	}


	// start of styled-components
	const HeaderWrapper = styled.View`
		padding-horizontal: 12px;
		flex-direction: row;
		align-items: center;
		padding-vertical: 4px;
	`;

	const Header = styled.Text`
		font-size: 21px;
		font-family: Muli-SemiBold;
		margin-left: 4px;
		color: ${appTheme.MAIN_TEXT};
	`;
	// end of styled-components


	return (
		<View style={{
			backgroundColor: appTheme.MAIN_BG,
			paddingBottom: 12
		}}>
			{
					<SectionList 
						sections={rssObj}
						keyExtractor={(item, i) => i.toString()}
						renderItem = {({ item, section: {key}}) => {
							// search if item key is present in an activeCatList array
							// indexOf() returns index of that element, or -1 when not find
							const INDEX = activeCatList.indexOf(key);
							if(INDEX > -1){
								return (
									<ReadCard
										title={item.title}
										date_published={item.date_published} 
										url={item.url} 
										publisher_name={item.publisher_name}
										categories={item.categories}
										restartEdit={props.restartEdit}
									/> 
								)
							} else {
								return null
							}
							
						}}
						renderSectionHeader={ ({section: {name, key}}) => ReadCardHeader(name, key) }
						ItemSeparatorComponent={({section: {key}}) => {
							// if section for this items is collapsed 
							// don't display separatorComponent
							const INDEX = activeCatList.indexOf(key);
							if(INDEX > -1) {
								return ReadCardSep()

							} else {
								return null
							}
						}}
					/>
			}
		</View>
	);
	
}; export default withTheme(CategoryCard);