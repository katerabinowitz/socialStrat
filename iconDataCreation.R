library(dplyr)

app<-expand.grid(race = c("white","black","latino","other"), famType=c("man","woman","manDep","womanDep", "couple"),
            edu1 = c("noHS","HS","someCollege","BA","grad"), edu2 = c("noHS","HS","someCollege","BA","grad"), 
            income=c("0-20","20-40","40-60","60-80","80-100","100-125","125-150","150-200","200-300","300-400","400+"))

app <- app %>% mutate(icon=rep(0,5500),
                      edu2=ifelse(famType != "couple", NA, as.character(edu2))) %>%
              arrange(income, famType, race, edu1, edu2)

app <- unique(app) 

app <- app %>% arrange(income, famType, race, edu1, edu2)

table(app$famType)

#write.csv(app,"icons.csv")

icons<-read.csv("icons_filled.csv")

str(icons)

incCount <- icons %>% group_by(income, race, edu1) %>%
                      summarize(count=sum(icon)) %>%
                      arrange(income, race)

incCountT <- icons %>% group_by(income) %>%
  summarize(count=sum(icon)) %>%
  arrange(count)
