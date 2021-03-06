USE [C70_SellersPlace]
GO
/****** Object:  UserDefinedTableType [dbo].[UrlLinkTable]    Script Date: 4/26/2019 4:40:00 PM ******/
CREATE TYPE [dbo].[UrlLinkTable] AS TABLE(
	[Url] [nvarchar](255) NULL,
	[EntityType] [int] NULL
)
GO
/****** Object:  StoredProcedure [dbo].[Events_InsertCopyEvent]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Events_InsertCopyEvent]
				@EventId int  --existing event id, this is how it's secured
				,@UserId int
				,@Id int out--new event id

		---This proc was created to copy all data related to an event, so that promoters could easily reproduce recurring events

as


/*

declare @EventId int = 118
		,@UserId int = 145
		,@Id int

Exec dbo.Events_InsertCopyEvent @EventId, @UserId, @Id out

select * from dbo.Events where Id = @Id
select * from dbo.Images where EntityId = @Id and EntityTypeId = 7
select * from dbo.Images where EntityId = @Id and EntityTypeId = 12
select * from dbo.Urls where EntityId = @Id and EntityTypeId = 7
select * from dbo.EventOfferings where EventId = @Id


*/


begin




		SET XACT_ABORT ON
		Declare @Tran nvarchar(50)  = '_CopyEventTransaction'
 
		BEGIN TRY
 
		BEGIN Transaction @Tran
 
	----------------Copying Event---------------
		INSERT INTO [dbo].[Events]
					([EventTypeId]
					,[Name]
					,[Summary]
					,[Headline]
					,[Description]
					,[VenueId]
					,[EventStatusId]
					,[License]
					,[IsFree]
					,[DateCreated]
					,[DateModified]
					,[SetupTime]
					,[DateStart]
					,[DateEnd]
					,[PromoterId])
				Select
					[EventTypeId]
					,[Name]
					,[Summary]
					,[Headline]
					,[Description]
					,[VenueId]
					,3
					,[License]
					,[IsFree]
					,GETUTCDATE()
					,GETUTCDATE()
					,[SetupTime]
					,[DateStart]
					,[DateEnd]
					,[PromoterId]
				from dbo.Events
				Where Id = @EventId
				SET @Id = SCOPE_IDENTITY() --Used to make new inserts!


------------------------Copying Offerings----------------------------------------

				INSERT INTO [dbo].[EventOfferings]
							([EventId]
							,[OfferingLookupId])
						Select
							@Id
							,[OfferingLookupId]
					From dbo.EventOfferings
					Where EventId = @EventId




------------------------Copying Urls---------------------------------------------


					INSERT INTO [dbo].[Urls]
								([EntityId]
								,[EntityTypeId]
								,[Url]
								,[UrlTypeId]
								,[UserId]
								,[DateCreated]
								,[DateModified])
						Select
								@Id
								,[EntityTypeId]
								,[Url]
								,[UrlTypeId]
								,[UserId]
								,GETUTCDATE()
								,GETUTCDATE()

					From dbo.Urls
					Where EntityId = @EventId
					and UserId = @UserId
					and EntityTypeId = 7


-----------------------------Copying Images for EntityType Events-----------------------------------


					INSERT INTO [dbo].[Images]
								([UserId]
								,[EntityId]
								,[EntityTypeId]
								,[Url]
								,[Title]
								,[DateCreated]
								,[DateModified]
								,[Description])
							Select
								[UserId]
								,@Id
								,[EntityTypeId]
								,[Url]
								,[Title]
								,GETUTCDATE()
								,GETUTCDATE()
								,[Description]

						From dbo.Images
						Where EntityId = @EventId
						and UserId = @UserId
						and EntityTypeId = 7


--------------------------Copying Images for Entity Type EventMainImage-------------------------


					INSERT INTO [dbo].[Images]
							   ([UserId]
							   ,[EntityId]
							   ,[EntityTypeId]
							   ,[Url]
							   ,[Title]
							   ,[DateCreated]
							   ,[DateModified]
							   ,[Description])
						 Select
							   [UserId]
							   ,@Id
							   ,[EntityTypeId]
							   ,[Url]
							   ,[Title]
							   ,GETUTCDATE()
							   ,GETUTCDATE()
							   ,[Description]

						From dbo.Images
						Where EntityId = @EventId
						and UserId = @UserId
						and EntityTypeId = 12
 
				Commit Transaction @Tran
 
				END TRY
				BEGIN Catch
 

 
					IF (XACT_STATE()) = -1  
					BEGIN  
						PRINT 'The transaction is in an uncommittable state.' +  
							  ' Rolling back transaction.'  
						ROLLBACK TRANSACTION @Tran;;  
					END;  

					IF (XACT_STATE()) = 1  
					BEGIN  
						PRINT 'The transaction is committable.' +   
							  ' Committing transaction.'  
						COMMIT TRANSACTION @Tran;;     
					END; 
					THROW
 
				End Catch
 
 
 
 
				SET XACT_ABORT OFF


end
GO
/****** Object:  StoredProcedure [dbo].[Images_UserInsert]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Images_UserInsert]
			@UserId int
			,@ProfileImage nvarchar(255)

--this proc is meant to be used by dbo.UserProfile_UpdateContactWithInserts

--it automatically removes all other images IN USER ENTITY TYPE.

as

/*

declare @UserId int = 33
		,@ProfileImage nvarchar(255) = 'www.amazonbucket.com'

exec dbo.Images_UserInsert @UserId, @ProfileImage

select * from dbo.Images where [UserId] = @UserId

*/


begin

	delete from dbo.Images
	where [UserId] = @UserId
	and EntityTypeId = 3 -- user! this is their profile image!

	INSERT INTO [dbo].[Images]
           ([UserId]
           ,[EntityId]
		   ,[EntityTypeId]
           ,[Url]
           ,[Title]
           ,[Description])
     VALUES
           (@UserId
           ,@UserId
		   ,3
		   ,@ProfileImage
		   ,'Profile Image'
		   ,'Profile Image')



end
GO
/****** Object:  StoredProcedure [dbo].[Promoters_SelectPublicPaginated]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Promoters_SelectPublicPaginated]
						@PageIndex int
						,@PageSize int	

as
/*
	DECLARE @PageIndex int = 0,
		@PageSize int = 1800

	EXECUTE dbo.Promoters_SelectPublicPaginated @PageIndex,
		@PageSize

*/
begin

			SELECT p.[Id]
				  ,[ShortDescription]
				  ,[LongDescription]
				  ,[BusinessId]
				  ,p.DateCreated
				  ,p.DateModified
				  ,i.Url
				  ,TotalCount = count(1) over()
				  , count(e.PromoterId) as eventCount
			  FROM [dbo].[Promoters] as p
			  left join dbo.Businesses as b
				on b.Id = p.BusinessId
			  left outer join dbo.Images as i
				on b.UserId = i.UserId 
				and p.Id = i.EntityId 
				and i.EntityTypeId = 5
			  left join dbo.Events as e 
				 on e.PromoterId = p.Id
				where i.Url is not null

				  group by p.Id, 
				  ShortDescription, 
				  LongDescription, BusinessId, 
				  p.DateCreated, p.DateModified, i.Url

  			order by eventCount desc
			offset (@PageIndex) * @PageSize rows
			fetch next @PageSize rows only



end
GO
/****** Object:  StoredProcedure [dbo].[Security_Events_CanWrite]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Security_Events_CanWrite]

--this proc is for updating and deleting a specific event. Trying to post a new one? Try dbo.Security_EventsPromoter_CanWrite

				@UserId int
				,@EntityId int -- event id
				,@HasAccess bit output


as

/*
--------------TEST CODE-----------------

declare @UserId int = 33
		,@EntityId int = 32
		,@HasAccess bit

exec dbo.Security_Events_CanWrite @userId, @EntityId, @HasAccess out

select @HasAccess

*/

begin


			set @HasAccess = 0

			if exists (select 1
						from dbo.Events as e
						inner join dbo.Promoters as p
						on e.PromoterId = p.Id
						inner join dbo.Businesses as b
						on b.Id = p.BusinessId
						where e.Id = @EntityId
						and b.UserId = @UserId)

			begin
				 set @HasAccess = 1
			end

end
GO
/****** Object:  StoredProcedure [dbo].[Security_ImagesEntity_CanWrite]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Security_ImagesEntity_CanWrite]

				@UserId int --used to track through tables to verify ownership
				,@EntityId int --entity type id
				,@HasAccess bit output

as

/*
-----------TEST CODE----------------------

-- this proc checks to ensure user is associated with entity they are attempting to insert for

declare @userId int = 146
		,@EntityId int = 12
		,@HasAccess bit

exec dbo.Security_ImagesEntity_CanWrite @UserId, @EntityId, @HasAccess out

SELECT @HasAccess
*/

begin


			set @HasAccess = 0

			if (@EntityId = 1) --Business
			Begin

				if exists (select 1
							from dbo.Businesses as b
							where b.UserId = @UserId)
				
					Begin

						set @HasAccess = 1
						GOTO PROC_END

					End

			End
			
			if (@EntityId = 2) --VendorMainImage
			--ent id is to vendor, vendor id must be associated with user id
			begin

				if exists (select 1
							from dbo.Vendors as v
							inner join dbo.Businesses as b
							on v.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 3) -- User, free to post for themself
			begin

				set @HasAccess = 1
				GOTO PROC_END

			end

			if (@EntityId = 4) --Promoter
			begin

				if exists (select 1
							from dbo.Promoters as p
							inner join dbo.Businesses as b
							on p.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 5) -- PromoterMainImage --promoter.id=ent id
			begin

				if exists (select 1
							from dbo.Promoters as p
							inner join dbo.Businesses as  b
							on p.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end
			end

			if (@EntityId = 6) -- Venues, there is a venue owner table that is not in use
			begin
					
				if exists (select 1
							from dbo.Venues as v
							where v.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 7) --Events, goes through promoters to business for user id
			begin
					
				if exists (select 1
							from dbo.Events as e
							inner join dbo.Promoters as p
							on e.PromoterId = p.Id
							inner join dbo.Businesses as b
							on b.Id = p.BusinessId
							and b.UserId = @UserId)
					
					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 8) --ProductImages // Neil says the image comes before the product id
			--UPATE entity id is the vendor id, entity id for image insert is vendor id, which imageid is used for product table.
			begin
				
				if exists (select 1
							from dbo.Vendors as v
							inner join dbo.Businesses as b
							on v.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 9) -- PromoterLogo
			--entity id is tied to the promoter
			begin 

				if exists (select 1
							from dbo.Promoters as p
							inner join dbo.Businesses as b
							on p.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 10) --VendorLogo
			--vendor ent id
			begin

				if exists (select 1
							from dbo.Vendors as v
							inner join dbo.Businesses as b
							on v.BusinessId = b.Id
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end
			
			end

			if (@EntityId = 11) --BusinessLogo
			--business ent id
			begin

				if exists (select 1
							from dbo.Businesses as b
							where b.UserId = @UserId)


					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end

			if (@EntityId = 12) --Event Main Image
			--business ent id
			begin

				if exists (select 1
							from dbo.Events as e
							inner join dbo.Promoters as p
							on e.PromoterId = p.Id
							inner join dbo.Businesses as b
							on b.Id = p.BusinessId
							and b.UserId = @UserId)

					begin

						set @HasAccess = 1
						GOTO PROC_END

					end

			end



					PROC_END:
					RETURN
			
end
GO
/****** Object:  StoredProcedure [dbo].[Urls_UserInsert]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[Urls_UserInsert]

			@UserId int
			,@UrlLink dbo.UrlLinkTable readonly

--this proc was not desgined for use in the mid tier, it is currently in use by dbo.UserProfiles_UpdateContactWithInserts

as

/*

Declare		@UserId int = 36
			,@UrlLink dbo.UrlLinkTable

insert into @UrlLink values ('www.facebook.com', 4), ('www.testinginsert.com', 5)

Exec dbo.Urls_UserInsert @UserId, @UrlLink

select * from dbo.Urls

*/


begin

		delete from dbo.Urls
		where UserId = @UserId
		and EntityTypeId = 3

		INSERT INTO [dbo].[Urls]
				   ([EntityId]
				   ,[EntityTypeId]
				   ,[Url]
				   ,[UrlTypeId]
				   ,[UserId]
				   ,[DateCreated]
				   ,[DateModified])

			Select @UserId
					,3
					,[Url]					
					,[EntityType]
				    ,@UserId
				    ,GETUTCDATE()
				    ,GETUTCDATE()
				    from @UrlLink as ul


end
GO
/****** Object:  StoredProcedure [dbo].[UserProfiles_UpdateContactWithInserts]    Script Date: 4/26/2019 4:40:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE proc [dbo].[UserProfiles_UpdateContactWithInserts]
				@UrlLink dbo.UrlLinkTable readonly
				,@ProfileImage nvarchar(255)
				,@FirstName nvarchar(255)
				,@LastName nvarchar(255)
				,@PhoneNumber nvarchar(50)
				,@Id int
				,@UserId int


as

/*

Declare 		@UrlLink dbo.UrlLinkTable
				,@ProfileImage nvarchar(255) = 'www.amazonbucket.com'
				,@FirstName nvarchar(255) = 'Paul'
				,@LastName nvarchar(255) = 'Fox'
				,@PhoneNumber nvarchar(50) = '867-5309'
				,@Id int = 89
				,@UserId int = 33

insert into @UrlLink values ('www.bestvendor.com', 4), ('www.facebook.com', 1)

Select * from dbo.UserProfiles where Id = @Id

Exec dbo.UserProfiles_UpdateContactWithInserts
				@UrlLink
				,@ProfileImage
				,@FirstName
				,@LastName
				,@PhoneNumber
				,@Id
				,@UserId

select * from dbo.UserProfiles where Id = @Id
select * from dbo.Urls where UserId = @UserId
select * from dbo.Images where UserId = @UserId

*/


begin


			UPDATE [dbo].[UserProfiles]
			   SET [DateModified] = GETUTCDATE()
				  ,[FirstName] = @FirstName
				  ,[LastName] = @LastName
				  ,[PhoneNumber] = @PhoneNumber
			 WHERE UserId = @Id

			 exec dbo.Urls_UserInsert @UserId, @UrlLink

			 exec dbo.Images_UserInsert @UserId, @ProfileImage


end
GO
